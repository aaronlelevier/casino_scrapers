import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import LD from 'bsrs-ember/vendor/defaults/location';
import LF from 'bsrs-ember/vendor/location_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import dtPage from 'bsrs-ember/tests/pages/dt';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import {dtd_payload} from 'bsrs-ember/tests/helpers/payloads/dtd';
import {ticket_dt_new_payload} from 'bsrs-ember/tests/helpers/payloads/ticket';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const DASHBOARD_URL = BASEURLS.dashboard_url;
const DT_URL = BASEURLS.base_dt_url;
const DT_NEW_URL = `${DT_URL}/new`;

const SEARCH = '.ember-power-select-search input';

const PREFIX = config.APP.NAMESPACE;
const DTD_URL = BASEURLS.base_dtd_url;
const DTD_API_URL = `${PREFIX}${DTD_URL}/`;
const TICKET_URL = BASEURLS.base_tickets_url;
const DT_TICKET_POST_URL = `${PREFIX}/dt/ticket/`;
const DT_START_URL = `${DT_URL}/${DT.idOne}`;

let application, store, endpoint, original_uuid;

module('Acceptance | dt new', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${DTD_URL}/`;
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

test('go to /dashboard, click button to get to /dt/new', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
  generalPage.clickLaunchDTTicket();
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
  });
});

test('has_multi_locations === true, can POST data, and transition to /dt/{start-id}', assert => {
  visit(DT_NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
    assert.equal(dtPage.requester, '');
    assert.equal(dtPage.locationsValue, '');
  });
  // requester
  dtPage.requesterFillin(TICKET.requesterOne);
  andThen(() => {
    assert.equal(dtPage.requester, TICKET.requesterOne);
    assert.equal(store.findOne('ticket').get('requester'), TICKET.requesterOne);
  });
  // location
  xhr(`${PREFIX}/admin/locations/?page=1&name__icontains=a`, 'GET', null, {}, 200, LF.search_idThree());
  dtPage.locationsClickDropdown();
  fillIn(`${SEARCH}`, 'a');
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
    assert.equal(ticketPage.locationOptionLength, 1);
  });
  dtPage.locationsOptionOneClick();
  andThen(() => {
    assert.equal(dtPage.locationsValue, LD.storeNameThree);
    assert.equal(store.findOne('ticket').get('location.id'), LD.idThree);
  });
  // POST
  let dtd_response = DTF.generate(DT.idOne);
  xhr(DT_TICKET_POST_URL, 'POST', JSON.stringify(ticket_dt_new_payload), {}, 201, dtd_response);
  dtPage.clickStart();
  andThen(() => {
    assert.equal(currentURL(), DT_START_URL);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('dtd_fk'), dtd_response.id);
  });
});

test('has_multi_locations === true, validation: cant click next until select location if multiple', assert => {
  // disabled
  visit(DT_NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
    assert.equal(dtPage.requester, '');
    assert.equal(dtPage.locationsValue, '');
    assert.ok(find('.t-dt-start').attr('disabled'));
  });
  // requester
  dtPage.requesterFillin(TICKET.requesterOne);
  andThen(() => {
    assert.equal(dtPage.requester, TICKET.requesterOne);
    assert.ok(find('.t-dt-start').attr('disabled'));
  });
  // location
  xhr(`${PREFIX}/admin/locations/?page=1&name__icontains=a`, 'GET', null, {}, 200, LF.search_idThree());
  dtPage.locationsClickDropdown();
  fillIn(`${SEARCH}`, 'a');
  dtPage.locationsOptionOneClick();
  andThen(() => {
    assert.equal(dtPage.locationsValue, LD.storeNameThree);
    assert.ok(!find('.t-dt-start').attr('disabled'));
  });
});

test('has_multi_locations === false, can POST data, and transition to /dt/{start-id}', assert => {
  let person;
  visit('/dashboard');
  andThen(() => {
    assert.equal(currentURL(), '/dashboard');
    let person_current = store.findOne('person-current');
    person = store.push('person', {id: person_current.get('id'), has_multi_locations: false});
    store.push('person-current', {id: person_current.get('id'), has_multi_locations: false});
    assert.ok(!person.get('has_multi_locations'));
  });
  visit(DT_NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
    assert.equal(dtPage.requester, '');
    let person_current = store.findOne('person-current').get('person');
    assert.equal(dtPage.locationsValue, store.find('person', person_current.get('id')).get('locations').objectAt(0).get('name'));
  });
  // requester
  dtPage.requesterFillin(TICKET.requesterOne);
  andThen(() => {
    assert.equal(dtPage.requester, TICKET.requesterOne);
    assert.equal(store.findOne('ticket').get('requester'), TICKET.requesterOne);
  });
  // POST
  let dtd_response = DTF.generate(DT.idOne);
  var payload = {
      id: 1,
      cc: [],
      categories: [],
      requester: TICKET.requesterOne,
      location: LD.idZero,
      attachments: []
  };
  xhr(DT_TICKET_POST_URL, 'POST', JSON.stringify(payload), {}, 201, dtd_response);
  dtPage.clickStart();
  andThen(() => {
    assert.equal(currentURL(), DT_START_URL);
    let ticket = store.findOne('ticket');
    assert.equal(ticket.get('dtd_fk'), dtd_response.id);
  });
});
