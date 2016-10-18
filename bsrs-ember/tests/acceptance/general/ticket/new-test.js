import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
// import timemachine from 'vendor/timemachine';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import {ticket_payload, required_ticket_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/tickets';
import moment from 'moment';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TICKETS_URL, LOCATIONS_URL, PEOPLE_URL, CATEGORIES_URL, DT_URL } from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const TICKET_NEW_URL = BASE_URL + '/new/1';
const TICKET_POST_URL = TICKETS_URL;
const NUMBER_6 = {keyCode: 54};
const LETTER_B = {keyCode: 66};
const BACKSPACE = {keyCode: 8};
const SPACEBAR = {keyCode: 32};
const LOCATION = '.t-ticket-location-select .ember-basic-dropdown-trigger';
const DROPDOWN = options;
const ASSIGNEE = '.t-ticket-assignee-select .ember-basic-dropdown-trigger';
const CC = '.t-ticket-cc-select .ember-basic-dropdown-trigger';
const CC_SEARCH = '.ember-power-select-trigger-multiple-input';
const SEARCH = '.ember-power-select-search input';

let store, list_xhr, location_xhr, people_xhr, counter;

moduleForAcceptance('Acceptance | ticket new test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(TICKETS_URL+'?page=1', 'GET', null, {}, 200, TF.empty());
    location_xhr = xhr(`${LOCATIONS_URL}location__icontains=6/`, 'GET', null, {}, 200, LF.search_power_select());
    counter = 0;
    random.uuid = function() { return UUID.value; };
    // timemachine.config({
    //   dateString: 'December 25, 2015 13:12:59'
    // });
  },
  afterEach() {
    counter = 0;
  }
});

test('validation works and when hit save, we do same post', (assert) => {
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 0, 'initial validation errors is zero');
    assert.notOk(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
  });
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 4);
    assert.ok(page.requestValidationErrorVisible);
    assert.ok(page.requesterValidationErrorVisible);
    assert.ok(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.location'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(2)').text().trim(), t('errors.ticket.requester'));
  });
  page.requesterFillIn(TD.requesterOne);
  triggerEvent('.t-ticket-requester', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 3);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.ok(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.location'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(2)').text().trim(), t('errors.ticket.request'));
  });
  page.statusClickDropdown();
  page.statusClickOptionOne();
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 3);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.ok(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.location'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(2)').text().trim(), t('errors.ticket.request'));
  });
  page.priorityClickDropdown();
  page.priorityClickOptionOne();
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 3);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.ok(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.location'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(2)').text().trim(), t('errors.ticket.request'));
  });
  people_xhr = xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  page.assigneeClickDropdown();
  fillIn(SEARCH, 'b');
  page.assigneeClickOptionTwo();
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 3);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.ok(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.location'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(2)').text().trim(), t('errors.ticket.request'));
  });
  page.locationClickDropdown();
  fillIn(SEARCH, '6');
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
    assert.ok(page.categoryValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.request'));
  });
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
    assert.ok(page.categoryTwoValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.request'));
  });
  const payload = CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1);
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, payload);
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 2);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
    assert.notOk(page.categoryTwoValidationErrorVisible);
    assert.ok(page.categoryThreeValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.categories'));
    assert.equal($('.validated-input-error-dialog:eq(1)').text().trim(), t('errors.ticket.request'));
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.ok(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
    assert.notOk(page.categoryValidationErrorVisible);
    assert.notOk(page.categoryTwoValidationErrorVisible);
    assert.notOk(page.categoryThreeValidationErrorVisible);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.ticket.request'));
  });
  fillIn('.t-ticket-request', TD.requestOne);
  triggerEvent('.t-ticket-request', 'keyup', {keyCode: 65});
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.notOk(page.requestValidationErrorVisible);
    assert.notOk(page.requesterValidationErrorVisible);
    assert.notOk(page.locationValidationErrorVisible);
  });
  generalPage.save();
  xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    const ticket = store.find('ticket').objectAt(0);
    assert.equal(ticket.get('new'), undefined);
    assert.equal(ticket.get('new_pk'), undefined);
    // assert.equal(ticket.get('created'), moment(new Date()).toISOString());
  });
});

test('selecting a top level category will alter the url and can cancel/discard changes and return to index', (assert) => {
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  clearxhr(location_xhr);
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('category').get('length'), 0);
    let tickets = store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.ok(tickets.objectAt(0).get('isNotDirtyOrRelatedNotDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsNotDirty'));//jenkins fail
    assert.equal(components, 1);
  });
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('ticket').get('length'), 1);
    assert.equal(store.find('category').get('length'), 3);
    let tickets = store.find('ticket');
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
    assert.equal(components, 2);
    assert.equal(find('.t-model-category-label:eq(0)').text(), CD.labelOne);
    assert.equal(find('.t-model-category-label:eq(1)').text(), CD.subCatLabelOne);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(store.find('category').get('length'), 3);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
    assert.ok(tickets.objectAt(0).get('isDirtyOrRelatedDirty'));
    // assert.ok(tickets.objectAt(0).get('categoriesIsDirty'));
    assert.equal(components, 2);
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      // assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
      assert.ok(generalPage.modalIsHidden);
      let components = page.powerSelectComponents;
      let tickets = store.find('ticket');
      assert.equal(tickets.get('length'), 1);
      assert.equal(store.find('category').get('length'), 3);
      assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
      assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 2);
      assert.equal(tickets.objectAt(0).get('categories').objectAt(1).get('children').get('length'), 0);
      assert.equal(components, 2);
    });
  });
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_NEW_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'));
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'));
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), TICKET_URL);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});

test('selecting category tree and removing a top level category will remove children categories already selected', (assert) => {
  clearxhr(list_xhr);
  clearxhr(location_xhr);
  //clear out first xhr to change unusedId has_children to true
  page.visitNew();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.equal(components, 1);
  });
  //first select
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('ticket').get('length'), 1);
    let tickets = store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(components, 2);
  });
  //second select
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //third select
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
    assert.equal(components, 3);
  });
  //change second with same children as electrical (outlet);
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.unusedId, CD.nameUnused, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionTwo();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //change top level
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').objectAt(0).get('children').get('length'), 0);
    assert.equal(components, 1);
  });
});

test('when selecting a new parent cateogry it should remove previously selected child category', (assert) => {
  clearxhr(list_xhr);
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 0);
    assert.equal(components, 1);
  });
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  //first select
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    assert.equal(store.find('ticket').get('length'), 1);
    let tickets = store.find('ticket');
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 1);
    assert.equal(components, 2);
  });
  //second select
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 2);
    assert.equal(components, 3);
  });
  //third select
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  page.categoryThreeClickDropdown();
  page.categoryThreeClickOptionOne();
  andThen(() => {
    let components = page.powerSelectComponents;
    let tickets = store.find('ticket');
    assert.equal(tickets.get('length'), 1);
    assert.equal(tickets.objectAt(0).get('categories').get('length'), 3);
    assert.equal(components, 3);
  });
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.unusedId, CD.nameUnused, [{id: CD.idChild}], CD.idOne, 1));
  page.categoryTwoClickDropdown();
  page.categoryTwoClickOptionTwo();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(!ticket.get('_location'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    let components = page.powerSelectComponents;
    assert.equal(components, 3);
  });
  page.categoryOneClickDropdown();
  page.categoryOneClickOptionTwo();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(!ticket.get('_location'));
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
    let components = page.powerSelectComponents;
    assert.equal(components, 1);
  });
});

/*TICKET TO ASSIGNEE*/
test('assignee component shows assignee for ticket and will fire off xhr to fetch assignees on search to change assignee', (assert) => {
  clearxhr(list_xhr);
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    assert.equal(page.assigneeInput, t(GLOBALMSG.assignee_power_select));
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), undefined);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
  });
  xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  page.assigneeClickDropdown();
  fillIn(SEARCH, 'b');
  andThen(() => {
    assert.equal(page.assigneeInput, t(GLOBALMSG.assignee_power_select));
    assert.equal(page.assigneeOptionLength, 10);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    assert.equal(find(`${DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  });
  page.assigneeClickOptionOne();
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  });
  page.assigneeClickDropdown();
  fillIn(SEARCH, '');
  andThen(() => {
    assert.equal(page.assigneeOptionLength, 1);
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
  });
  fillIn(SEARCH, 'b');
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
    assert.equal(page.assigneeOptionLength, 10);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    assert.equal(find(`${DROPDOWN} > li:eq(1)`).text().trim(), `${PD.nameBoy2} ${PD.lastNameBoy2}`);
  });
  page.assigneeClickOptionTwo();
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), PD.idSearch);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  //search specific assignee
  xhr(`${PEOPLE_URL}person__icontains=Boy1/`, 'GET', null, {}, 200, PF.search_power_select());
  page.assigneeClickDropdown();
  fillIn(SEARCH, 'Boy1');
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
  });
  page.assigneeClickOptionOne();
  andThen(() => {
    assert.equal(page.assigneeInput, `${PD.nameBoy} ${PD.lastNameBoy}`);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('assignee.id'), PD.idBoy);
    assert.equal(ticket.get('assignee_fk'), undefined);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
});

/*TICKET TO LOCATION 1 to Many*/
test('selecting new location will not affect other power select components and will only render one tab', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  page.priorityClickDropdown();
  page.priorityClickOptionOne();
  page.locationClickDropdown();
  fillIn(SEARCH, '6');
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.priorityInput, TD.priorityOne);
    assert.equal(page.locationInput, LD.storeNameTwo);
    assert.equal(find('.t-tab').length, 1);
  });
});

test('location new component shows location for ticket and will fire off xhr to fetch locations on search to change location', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  page.locationClickDropdown();
  fillIn(SEARCH, '6');
  andThen(() => {
    assert.equal(find(`${DROPDOWN} > li`).length, 2);
  });
  page.locationClickOptionTwo();
  andThen(() => {
    assert.equal(page.locationInput, LD.storeNameTwo);
    let ticket = store.find('ticket');
    assert.equal(ticket.objectAt(0).get('location.id'), LD.idTwo);
    assert.equal(ticket.objectAt(0).get('location_fk'), undefined);
    assert.ok(ticket.objectAt(0).get('isDirtyOrRelatedDirty'));
  });
});

test('removes location dropdown on search to change location', (assert) => {
  clearxhr(list_xhr);
  page.visitNew();
  page.locationClickDropdown();
  fillIn(SEARCH, '6');
  andThen(() => {
    assert.equal(page.locationOptionLength, 2);
  });
  fillIn(SEARCH, ' ');
  andThen(() => {
    assert.equal(find(`${DROPDOWN}`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(SEARCH, '6');
  andThen(() => {
    assert.equal(page.locationOptionLength, 2);
  });
});

/*TICKET CC M2M*/
test('clicking and typing into power select for people will fire off xhr request for all people', (assert) => {
  clearxhr(list_xhr);
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(!ticket.get('cc.length'));
  });
  let people_endpoint = `${PEOPLE_URL}person__icontains=a/`;
  ajax(people_endpoint, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, '');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
  });
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
  });
  //search specific cc
  page.ccClickDropdown();
  xhr(`${PEOPLE_URL}person__icontains=Boy/`, 'GET', null, {}, 200, PF.search_power_select());
  fillIn(`${CC_SEARCH}`, 'Boy');
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccOptionLength, 10);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), `${PD.nameBoy} ${PD.lastNameBoy}`);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
  });
  page.ccClickOptionOne();
  andThen(() => {
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.equal(page.ccTwoSelected.indexOf(PD.nameBoy), 2);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(ticket.get('cc').objectAt(1).get('id'), PD.idBoy);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
});

test('can remove and add back same cc and save empty cc', (assert) => {
  clearxhr(list_xhr);
  clearxhr(location_xhr);
  page.visitNew();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.ok(!ticket.get('cc.length'));
  });
  let people_endpoint = `${PEOPLE_URL}person__icontains=a/`;
  ajax(people_endpoint, 'GET', null, {}, 200, PF.get_for_power_select(PD.idDonald, PD.donald_first_name, PD.donald_last_name));
  page.ccClickDropdown();
  fillIn(`${CC_SEARCH}`, 'a');
  andThen(() => {
    assert.equal(page.ccOptionLength, 1);
    assert.equal(find(`${DROPDOWN} > li:eq(0)`).text().trim(), PD.donald);
  });
  page.ccClickDonald();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 1);
    assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.donald_first_name);
    assert.equal(page.ccSelected.indexOf(PD.donald), 2);
    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
  });
  page.ccOneRemove();
  andThen(() => {
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('cc').get('length'), 0);
  });
});

//test('all required fields persist correctly when the user submits a new ticket form', (assert) => {
//  page.visit();
//  andThen(() => {
//    patchRandom(counter);
//  });
//  click('.t-add-new');
//  andThen(() => {
//    assert.equal(currentURL(), TICKET_NEW_URL);
//    assert.equal(store.find('ticket').get('length'), 1);
//    const ticket = store.find('ticket', UUID.value);
//    assert.ok(ticket.get('isNotDirty'));
//  });
//  people_xhr = xhr(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
//  page.assigneeClickDropdown();
//  fillIn(SEARCH, 'b');
//  page.assigneeClickOptionTwo();
//  andThen(() => {
//    assert.equal(page.assigneeInput, `${PD.nameBoy2} ${PD.lastNameBoy2}`);
//    let ticket = store.findOne('ticket');
//    assert.ok(ticket.get('assignee'));
//    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
//    assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//  });
//  page.statusClickDropdown();
//  page.statusClickOptionOne();
//  page.priorityClickDropdown();
//  page.priorityClickOptionOne();
//  andThen(() => {
//    let ticket = store.find('ticket', UUID.value);
//    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
//    assert.equal(ticket.get('status.id'), TD.statusOneId);
//    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
//  });
//  page.locationClickDropdown();
//  fillIn(SEARCH, '6');
//  andThen(() => {
//    //ensure route doesn't change current selections
//    assert.equal(page.locationOptionLength, 2);
//    let ticket = store.find('ticket', UUID.value);
//    assert.equal(ticket.get('assignee').get('id'), PD.idSearch);
//    assert.equal(ticket.get('status.id'), TD.statusOneId);
//    assert.equal(ticket.get('priority.id'), TD.priorityOneId);
//  });
//  page.locationClickOptionTwo();
//  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
//  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
//  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
//  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
//  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
//  page.categoryOneClickDropdown();
//  page.categoryOneClickOptionOne();
//  page.categoryTwoClickDropdown();
//  page.categoryTwoClickOptionOne();
//  page.categoryThreeClickDropdown();
//  page.categoryThreeClickOptionOne();
//  page.requestFillIn(TD.requestOneGrid);
//  page.requesterFillIn(TD.requesterOne);
//  required_ticket_payload.request = TD.requestOneGrid;
//  xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
//  generalPage.save();
//  andThen(() => {
//    assert.equal(currentURL(), TICKET_URL);
//    assert.equal(store.find('ticket').get('length'), 1);
//    let persisted = store.find('ticket', UUID.value);
//    assert.ok(persisted.get('assignee'));
//    assert.equal(persisted.get('new'), undefined);
//    assert.equal(persisted.get('assignee.id'), PD.idSearch);
//    assert.equal(persisted.get('request'), TD.requestOneGrid);
//    assert.ok(persisted.get('location'));
//    assert.equal(persisted.get('location.id'), LD.idTwo);
//    assert.equal(persisted.get('status.id'), TD.statusOneId);
//    assert.ok(persisted.get('isNotDirty'));
//    assert.ok(persisted.get('isNotDirtyOrRelatedNotDirty'));
//  });
//});

test('adding a new ticket should allow for another new ticket to be created after the first is persisted', (assert) => {
  ajax(`${PEOPLE_URL}person__icontains=b/`, 'GET', null, {}, 200, PF.search_power_select());
  page.visit();
  andThen(() => {
    patchRandom(counter);
  });
  click('.t-add-new');
  selectSearch('.t-ticket-assignee-select', 'b');
  selectChoose('.t-ticket-assignee-select', PD.fullnameBoy2);
  selectChoose('.t-ticket-status-select', TD.statusOne);
  selectChoose('.t-ticket-priority-select', TD.priorityOne);
  selectSearch('.t-ticket-location-select', '6');
  selectChoose('.t-ticket-location-select', LD.storeNameTwo);
  // page.locationClickOptionTwo();
  let top_level_categories_endpoint = `${CATEGORIES_URL}parents/`;
  xhr(top_level_categories_endpoint, 'GET', null, {}, 200, CF.top_level());
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idOne}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idTwo, CD.nameTwo, [{id: CD.idChild}], CD.idOne, 1));
  ajax(`${CATEGORIES_URL}?parent=${CD.idTwo}&page_size=1000`, 'GET', null, {}, 200, CF.get_list(CD.idChild, CD.nameElectricalChild, [], CD.idTwo, 2));
  selectChoose('.t-model-category-select:eq(0)', CD.nameOne);
  selectChoose('.t-model-category-select:eq(1)', CD.nameTwo);
  selectChoose('.t-model-category-select:eq(2)', CD.nameElectricalChild);
  page.requestFillIn(TD.requestOneGrid);
  page.requesterFillIn(TD.requesterOne);
  required_ticket_payload.request = TD.requestOneGrid;
  xhr(TICKET_POST_URL, 'POST', JSON.stringify(required_ticket_payload), {}, 201, Ember.$.extend(true, {}, required_ticket_payload));
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), TICKET_URL);
    assert.equal(store.find('ticket').get('length'), 1);
  });
  click('.t-add-new');
  andThen(() => {
    assert.equal(currentURL(), TICKET_NEW_URL);
    assert.equal(store.find('ticket').get('length'), 2);
    assert.equal(find('.t-ticket-request').val(), '');
  });
});
