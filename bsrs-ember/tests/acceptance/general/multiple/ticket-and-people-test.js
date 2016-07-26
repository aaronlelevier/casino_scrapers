import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import config from 'bsrs-ember/config/environment';
import PD from 'bsrs-ember/vendor/defaults/person';
import PF from 'bsrs-ember/vendor/people_fixtures';
import CF from 'bsrs-ember/vendor/category_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LF from 'bsrs-ember/vendor/location_fixtures';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TICKETS_URL, TICKET_LIST_URL, PEOPLE_URL, PEOPLE_LIST_URL, CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const TICKET_DETAIL_URL = `${BASEURLS.base_tickets_url}/${TD.idOne}`;
const PEOPLE_DETAIL_URL = `${BASEURLS.base_people_url}/${PD.idOne}`;
const PEOPLE_DONALD_DETAIL_URL = `${BASEURLS.base_people_url}/${PD.idDonald}`;
const TOP_LEVEL_CATEGORIES_URL = `${CATEGORIES_URL}parents/`;
const TICKET_ACTIVITIES_URL = `${TICKETS_URL}${TD.idOne}/activity/`;
const LOCATION = '.t-person-locations-select .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-person-locations-select-dropdown > .ember-power-select-options';
const LOCATION_SEARCH = '.ember-power-select-trigger-multiple-input';

var application, store, person, ticket;

moduleForAcceptance('Acceptance | ticket and people test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
  },
});

test('clicking between person detail and ticket detail will not dirty the active person model', (assert) => {
  ajax(`${PREFIX}${PEOPLE_DETAIL_URL}/`, 'GET', null, {}, 200, PF.detail(PD.idOne));
  visit(PEOPLE_DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_DETAIL_URL);
    person = store.find('person', PD.idOne);
    assert.ok(person.get('localeIsNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('person_locations_fks').length, 1);
    assert.equal(person.get('locations.length'), 1);
  });
  ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    person = store.find('person', PD.idOne);
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('person_locations_fks').length, 1);
    assert.equal(person.get('locations.length'), 1);
    assert.equal(person.get('locations').objectAt(0).get('id'), LD.idOne);
  });
  ajax(`${PREFIX}${TICKET_DETAIL_URL}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  ajax(TICKET_ACTIVITIES_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_DETAIL_URL);
    ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
    person = store.find('person', PD.idOne);
    assert.ok(person.get('statusIsNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(person.get('person_locations_fks').length, 1);
    assert.equal(person.get('locations.length'), 1);
    const location = store.find('location', LD.idOne);
    assert.equal(location.get('id'), LD.idOne);
  });
  click('.t-tab:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_DETAIL_URL);
    person = store.find('person', PD.idOne);
    assert.equal(person.get('isDirtyOrRelatedDirty'), false);
    assert.ok(person.get('roleIsNotDirty'));
    assert.ok(person.get('statusIsNotDirty'));
    assert.ok(person.get('locationsIsNotDirty'));
    assert.equal(person.get('person_locations_fks').length, 1);
    assert.equal(person.get('locations.length'), 1);
    ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
  });
  click('.t-tab:eq(1)');
  andThen(() => {
    assert.equal(currentURL(), TICKET_DETAIL_URL);
    person = store.find('person', PD.idOne);
    assert.equal(person.get('isDirtyOrRelatedDirty'), false);
    ticket = store.find('ticket', TD.idOne);
    assert.equal(ticket.get('isDirtyOrRelatedDirty'), false);
  });
});

test('filter tickets by their location matching the logged in Persons location', (assert) => {
  // Tickets - are all viewable
  ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
  // Person - remove Locations
  const drumpf = PF.detail(PD.idDonald);
  drumpf.fullname = drumpf.first_name + ' ' + drumpf.last_name;
  ajax(`${PREFIX}${PEOPLE_DONALD_DETAIL_URL}/`, 'GET', null, {}, 200, drumpf);
  visit(PEOPLE_DONALD_DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_DONALD_DETAIL_URL);
    const person = store.find('person', PD.idDonald);
    assert.equal(person.get('locations').get('length'), 1);
  });
  click('.t-tab:eq(0)');
  click(`${LOCATION}:eq(0) .ember-power-select-multiple-remove-btn`);
  andThen(() => {
    const person = store.find('person', PD.idDonald);
    assert.equal(person.get('locations').get('length'), 0);
  });
  let payload = PF.put({id: PD.idDonald});
  payload.locations = [];
  ajax(`${PREFIX}${BASEURLS.base_people_url}/${PD.idDonald}/`, 'PUT', JSON.stringify(payload), {}, 200, {});
  ajax(`${PREFIX}${BASEURLS.base_people_url}/?page=1`, 'GET', null, {}, 200, PF.list());
  click('.t-save-btn');
  andThen(() => {
    assert.equal(currentURL(), `${BASEURLS.base_people_url}/index`);
  });
  // Tickets - no longer viewable b/c Person has no matching Locations to Ticket.locations
  ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    // assert.equal(find('.t-grid-data').length, 0);
  });
});

test('adding a new cc and navigating to the people url wont dirty the person model', (assert) => {
  ajax(`${PREFIX}${BASEURLS.base_tickets_url}/?page=1`, 'GET', null, {}, 200, TF.list());
  visit(TICKET_LIST_URL);
  ajax(`${PREFIX}${TICKET_DETAIL_URL}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
  ajax(TICKET_ACTIVITIES_URL, 'GET', null, {}, 200, TA_FIXTURES.empty());
  click('.t-grid-data:eq(0)');
  let PEOPLE_TICKETS_URL = `${PEOPLE_URL}person__icontains=m/`;
  ajax(PEOPLE_TICKETS_URL, 'GET', null, {}, 200, PF.get_for_power_select(PD.personListTwo));
  selectSearch('.t-ticket-cc-select', 'm');
  selectChoose('.t-ticket-cc-select', PD.fullname);
  andThen(() => {
    assert.equal(currentURL(), TICKET_DETAIL_URL);
    ticket = store.find('ticket', TD.idOne);
    assert.ok(ticket.get('ccIsDirty'));
    person = store.find('person', PD.personListTwo);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('roleIsNotDirty'));
    // assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
  generalPage.clickAdmin();
  ajax(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  generalPage.clickPeople();
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    person = store.find('person', PD.personListTwo);
    assert.ok(person.get('isNotDirty'));
    assert.ok(person.get('isNotDirtyOrRelatedNotDirty'));
  });
});
