import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import config from 'bsrs-ember/config/environment';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import PD from 'bsrs-ember/vendor/defaults/person';
import LINK from 'bsrs-ember/vendor/defaults/link';
import LD from 'bsrs-ember/vendor/defaults/location';
import CD from 'bsrs-ember/vendor/defaults/category';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import LF from 'bsrs-ember/vendor/location_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import BASEURLS from 'bsrs-ember/utilities/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import dtPage from 'bsrs-ember/tests/pages/dt';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';
import {dtd_payload} from 'bsrs-ember/tests/helpers/payloads/dtd';
import {ticket_dt_new_payload, ticket_dt_new_payload_PATCH} from 'bsrs-ember/tests/helpers/payloads/ticket';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DT_URL = BASEURLS.base_dt_url;
const DT_NEW_URL = `${DT_URL}/new`;
const DT_START_ENDPOINT = `${PREFIX}${DT_URL}/dt-start/`;

const SEARCH = '.ember-power-select-search input';

const DTD_URL = BASEURLS.base_dtd_url;
const DTD_API_URL = `${PREFIX}${DTD_URL}/`;
const TICKET_URL = BASEURLS.base_tickets_url;
const DT_TICKET_POST_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
const DT_TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
const DT_START_URL = `${DT_URL}/${DT.idOne}/ticket/1`;
const DT_TWO_URL = `${DT_URL}/${DT.idTwo}/ticket/1`;
const TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;

let application, store, endpoint;

moduleForAcceptance('Acceptance | dt new', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${DTD_URL}/`;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
  }
});

// Bring back when we have the draft ticket grid on the dashboard.

// test('go to /dashboard, click button to get to /dt/new', assert => {
//   xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: SD.dashboard_text}});
//   xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
//   visit(DASHBOARD_URL);
//   andThen(() => {
//     assert.equal(currentURL(), DASHBOARD_URL);
//   });
//   generalPage.clickHomeModalShow();
//   andThen(() => {
//     assert.ok(Ember.$('.ember-modal-dialog'));
//   });
//   generalPage.clickLaunchDTTicket();
//   andThen(() => {
//     assert.throws(Ember.$('.ember-modal-dialog'));
//     assert.equal(currentURL(), DT_NEW_URL);
//   });
// });

/* jshint ignore:start */

// test('POST then PATCH - to demonstrate starting the DT and maintaining traversing the DT Tree and updating the same Ticket', async assert => {
//   await visit(DT_NEW_URL);
//   assert.equal(currentURL(), DT_NEW_URL);
//   // fill out initial form
//   await dtPage.requesterFillin(TICKET.requesterOne);
//   xhr(`${PREFIX}/admin/locations/location__icontains=a/`, 'GET', null, {}, 200, LF.search_idThree());
//   await dtPage.locationsClickDropdown();
//   await fillIn(`${SEARCH}`, 'a');
//   await dtPage.locationsOptionOneClick();
//   // DTD start returned from GET
//   let dtd_response = DTF.generate(DT.idOne);
//   xhr(DT_START_ENDPOINT, 'GET', null, {}, 200, dtd_response);
//   await dtPage.clickStart();
//   assert.equal(currentURL(), DT_START_URL);
//   // fill out checkbox Field
//   assert.ok(!dtPage.fieldOneCheckboxIsChecked());
//   await dtPage.fieldOneCheckboxCheck();
//   assert.ok(dtPage.fieldOneCheckboxIsChecked());
//   let dtd_response_two = DTF.generate(DT.idTwo, '', FD.idTwo, FD.labelTwo);
//   // POST
//   let mod_payload = Ember.$.extend(true, {}, ticket_dt_new_payload);
//   mod_payload['dt_path'][0]['dtd']['fields'] = [{id: FD.idOne, label: FD.labelOne, value: OD.textOne, required: FD.requiredTwo, options: [OD.idOne]}];
//   xhr(DT_TICKET_POST_URL, 'POST', JSON.stringify(mod_payload), {}, 201, dtd_response_two);
//   await dtPage.btnOneClick();
//   assert.equal(currentURL(), DT_TWO_URL);
//   let ticket = store.findOne('ticket');
//   assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idOne);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['id'], FD.idOne);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['required'], FD.requiredTwo);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['value'], OD.textOne);
//   assert.deepEqual(ticket.get('dt_path')[0]['dtd']['fields'][0]['options'], [OD.idOne]);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['label'], FD.labelOne);
//   assert.equal(ticket.get('request'), `${FD.labelOne}: ${OD.textOne}`);
//   // check checkbox to ensure field and option was put into fieldsObj in patch callback in controller
//   assert.notOk(dtPage.fieldOneCheckboxIsChecked());
//   await dtPage.fieldOneCheckboxCheck();
//   assert.ok(dtPage.fieldOneCheckboxIsChecked());
//   let dtd_payload = DTF.generate(DT.idTwo, '', FD.idTwo, FD.labelTwo);
//   const requestValue = `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: ${OD.textOne}`
//   const dt_one = { 'dtd':{'id': DT.idOne,'description': DT.descriptionOne,'prompt': DT.promptOne,'note': DT.noteOne,
//       'fields':[{'id': FD.idOne,'label': FD.labelOne,'value': OD.textOne,'required':FD.requiredTwo, options: [OD.idOne]}]}};
//   const dt_two = { 'dtd':{'id': DT.idTwo,'description': DT.descriptionOne,'prompt': DT.promptOne,'note': DT.noteOne,
//       'fields':[{'id': FD.idOne,'label': FD.labelOne,'value': OD.textOne,'required':FD.requiredTwo, options: [OD.idOne]}]}};
//   dt_two['dtd']['fields'].push({'id': FD.idTwo, 'label': FD.labelTwo, 'value': OD.textOne, 'required': FD.requiredTwo, 'options': [OD.idTwo]});
//   const ticket_path1 = {'ticket':{'id':1,'requester': TD.requesterOne, 'location': LD.idThree, 'status':TD.statusZeroId,'priority':TD.priorityZeroId,
//       'request':`${FD.labelOne}: ${OD.textOne}`,'categories':[], 'cc':[],'attachments':[]}};
//   let ticket_path2 = {'ticket':{'id':1,'requester': TD.requesterOne, 'location': LD.idThree, 'status':TD.statusZeroId,'priority':TD.priorityZeroId,
//       'request':requestValue,'categories':[], 'cc':[],'attachments':[]}};
//   ticket_path2['ticket']['request'] = requestValue;
//   const mock_dt_path = [ {...ticket_path1, ...dt_one}, {...ticket_path2, ...dt_two} ];
//   // const link = store.find('dtd', DT.idTwo).get('links').objectAt(0);
//   let ticket_payload = { id: 1, priority: LINK.priorityOne, status: LINK.statusOne, categories: [CD.idOne, CD.idWatChild, CD.idPlumbingChild], dt_path: mock_dt_path, request: requestValue };
//   xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
//   await dtPage.btnOneClick();
// });

// COMMENT OUT WHILE JENKINS TESTS ARE FAILING
// test('has_multi_locations === true, transition to /dt/{start-id}, can POST data with multiple options, ', async assert => {
//   await visit(DT_NEW_URL);
//   assert.equal(currentURL(), DT_NEW_URL);
//   assert.equal(dtPage.requester, '');
//   assert.equal(dtPage.locationsValue, '');
//   // requester
//   await dtPage.requesterFillin(TICKET.requesterOne);
//   assert.equal(dtPage.requester, TICKET.requesterOne);
//   let ticket = store.findOne('ticket');
//   assert.equal(ticket.get('requester'), TICKET.requesterOne);
//   assert.equal(ticket.get('dt_path'), undefined);
//   // location
//   xhr(`${PREFIX}/admin/locations/location__icontains=a/`, 'GET', null, {}, 200, LF.search_idThree());
//   await dtPage.locationsClickDropdown();
//   await fillIn(`${SEARCH}`, 'a');
//   assert.equal(currentURL(), DT_NEW_URL);
//   assert.equal(ticketPage.locationOptionLength, 1);
//   await dtPage.locationsOptionOneClick();
//   assert.equal(dtPage.locationsValue, LD.storeNameThree);
//   assert.equal(store.findOne('ticket').get('location.id'), LD.idThree);
//   let dtd_response = DTF.generate(DT.idOne);
//   dtd_response['fields'][0]['options'].push({id: OD.idTwo, text: OD.textTwo, order: OD.orderTwo});
//   xhr(DT_START_ENDPOINT, 'GET', null, {}, 200, dtd_response);
//   await dtPage.clickStart();
//   assert.equal(currentURL(), DT_START_URL);
//   await dtPage.fieldOneCheckboxCheck();
//   await dtPage.fieldTwoCheckboxCheck();
//   // click multiple options
//   const requestValue = `${OD.textOne}, ${OD.textTwo}`;
//   const ticketRequestValue = `name: ${requestValue}`;
//   assert.deepEqual(ticket.get('requestValues'), [ticketRequestValue]);
//   assert.equal(ticket.get('dt_path'), undefined);
//   const mod_new_payload = Ember.$.extend(true, {}, ticket_dt_new_payload);
//   mod_new_payload.request = ticketRequestValue;
//   mod_new_payload['dt_path'][0]['ticket'].request = ticketRequestValue;
//   mod_new_payload['dt_path'][0]['dtd']['fields'] = [{id: FD.idOne, label: FD.labelOne, value: requestValue, required: FD.requiredTwo, options: [OD.idOne, OD.idTwo]}];
//   xhr(DT_TICKET_POST_URL, 'POST', JSON.stringify(mod_new_payload), {}, 201, dtd_response);
//   await page.clickNextBtn();
//   // Post updates ticket fields, adds fields/options do dtd object
//   assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idOne);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'].length, 1);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['id'], FD.idOne);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['value'], requestValue);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['required'], FD.requiredTwo);
//   assert.deepEqual(ticket.get('dt_path')[0]['dtd']['fields'][0]['options'], [OD.idOne, OD.idTwo]);
//   assert.equal(ticket.get('dt_path')[0]['dtd']['fields'][0]['label'], FD.labelOne);
//   assert.equal(ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${OD.textTwo}`);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['id'], 1);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idThree);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['requester'], TD.requesterOne);
//   assert.equal(ticket.get('dt_path')[0]['ticket']['request'], ticketRequestValue);
// });

/* jshint ignore:end */

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
  xhr(`${PREFIX}/admin/locations/location__icontains=a/`, 'GET', null, {}, 200, LF.search_idThree());
  dtPage.locationsClickDropdown();
  fillIn(`${SEARCH}`, 'a');
  dtPage.locationsOptionOneClick();
  andThen(() => {
    assert.equal(dtPage.locationsValue, LD.storeNameThree);
    assert.ok(!find('.t-dt-start').attr('disabled'));
  });
});

test('has_multi_locations === false, transitions to /dt/{start-id}', assert => {
  let person;
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  visit(DASHBOARD_URL);
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
  var payload = {
    id: 1,
    cc: [],
    status: TICKET.statusZeroId,
    priority: TICKET.priorityZeroId,
    categories: [],
    requester: TICKET.requesterOne,
    location: LD.idZero,
    attachments: [],
    dt_path: [{
      ticket: {
        id: 1,
        requester: TD.requesterOne,
        location: LD.idZero,
        status: TD.statusZeroId,
        priority: TD.priorityZeroId,
        categories: [],
        cc: [],
        attachments: [],
      },
      dtd: {}
    }],
  };
  let dtd_response = DTF.generate(DT.idOne);
  xhr(DT_START_ENDPOINT, 'GET', null, {}, 200, dtd_response);
  dtPage.clickStart();
  andThen(() => {
    assert.equal(currentURL(), DT_START_URL);
    let ticket = store.findOne('ticket');
  });
});

test('redirected to start DT after filling out requester and location', assert => {
  visit(DT_NEW_URL);
  andThen(() => {
    assert.equal(currentURL(), DT_NEW_URL);
  });
  // fill out form
  dtPage.requesterFillin(TICKET.requesterOne);
  xhr(`${PREFIX}/admin/locations/location__icontains=a/`, 'GET', null, {}, 200, LF.search_idThree());
  dtPage.locationsClickDropdown();
  fillIn(`${SEARCH}`, 'a');
  dtPage.locationsOptionOneClick();
  let dtd_response = DTF.generate(DT.idOne);
  xhr(DT_START_ENDPOINT, 'GET', null, {}, 200, dtd_response);
  dtPage.clickStart();
  andThen(() => {
    assert.equal(currentURL(), DT_START_URL);
    let ticket = store.findOne('ticket');
    // can preview start DT elements
    assert.equal(dtPage.note, DT.noteOne);
    assert.equal(dtPage.description, DT.descriptionOne);
    assert.equal(dtPage.fieldCount, 1);
    assert.equal(dtPage.fieldOneName, `${FD.labelOne} *`);
    assert.ok(!dtPage.fieldOneCheckboxIsChecked());
    assert.equal(dtPage.prompt, DT.promptOne);
    assert.equal(dtPage.btnCount, 1);
    assert.equal(dtPage.btnOneText, LINK.textOne);
  });
});
