import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import LD from 'bsrs-ember/vendor/defaults/location';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import DT from 'bsrs-ember/vendor/defaults/dtd';
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import LINK from 'bsrs-ember/vendor/defaults/link';
import OD from 'bsrs-ember/vendor/defaults/option';
import BASEURLS from 'bsrs-ember/utilities/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import dtPage from 'bsrs-ember/tests/pages/dt';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dt_url;//Routing
const DTD_URL = BASEURLS.base_dtd_url;//Request
const TICKET_URL = BASEURLS.base_tickets_url;//Ticket
const DETAIL_URL = `${BASE_URL}/${DT.idOne}/ticket/${TD.idOne}`;
const TICKET_DETAIL_URL = `${TICKET_URL}/${TD.idOne}`;
const DEST_URL = `${BASE_URL}/${DT.idTwo}/ticket/${TD.idOne}`;
const ENDPAGE_URL = `${BASE_URL}/completed/${TD.idOne}`;
const DTD_TWO_URL = `${BASE_URL}/${DT.idTwo}/ticket/${TD.idOne}`;
const DTD_THREE_URL = `${BASE_URL}/${DT.idThree}/ticket/${TD.idOne}`;
const TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
const TICKET_SUBMIT_URL = `${PREFIX}/dt/submit/`;
const BAIL_TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idOne}/ticket/`;

let application, store, endpoint, link, dtd, dt_path, returned_ticket, dt_one;

moduleForAcceptance('Acceptance | dt detail', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/${DT.idOne}/ticket/?ticket=${TD.idOne}`;
    dtd = store.find('dtd', DT.idOne);
    setWidth('desktop');
    random.uuid = function() { return TD.idOne; };
    /*
     * NOTES
     * dt_path is previous state of ticket && dtd state (label, value, required, fields, options (array of ids))
     * returned_ticket is the ticket w/ the dt_path, which will be different and is returned on a get requests
     * all tests are assuming deep linking (i.e. clicking from ticket detail)
     * fieldsObj is not tested but is created upon initialization of dtd-preview component (only happens once) and then updated on subsequent requests in dt/controller
     * TODO: need to make sure request is in order when created
     */
    dt_one = { 'dtd':{'id': DT.idOne,'description': DT.descriptionOne,'prompt': DT.promptOne,'note': DT.noteOne,
        'fields':[{'id': FD.idOne,'label': FD.labelOne,'value': OD.textOne,'required':FD.requiredTwo},
        {'id':FD.idRandom,'label':'','value':'working','required':FD.requiredTwo}]} };
    const ticket = {
      id: TD.idOne,
      requester: TD.requesterOne,
      location: LD.idOne,
      status: TD.statusZeroId,
      priority: TD.priorityZeroId,
      categories: [],
      cc: [],
      attachments: [],
    };
    dt_path = [{
      ticket,
      dtd: {
        id: DT.idThree,
        description: DT.descriptionOne,
        fields: [
          { id: FD.idRandom, label: '', value: TD.requestOne, required: FD.requiredTwo }
        ]
      }
    }];
    returned_ticket = TF.detail(TD.idOne, null, dt_path);
    run(() => {
      store.push('ticket', {id: ticket.id});
    });
  },
});

/* jshint ignore:start */

test('decision tree displays data and can click to next destination after updating option (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data.fields[0].required = true;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  // assert.equal(find('.ember-modal-overlay').length, 1);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await page.fieldClickCheckboxOne();
  assert.notOk(find('.t-dtd-preview-btn').attr('disabled'));
  const ticket = store.find('ticket', TD.idOne);
  const checkbox_ticket_value = `${FD.labelOne}: ${OD.textOne}`;
  const requestValue = `${checkbox_ticket_value}, ${TD.requestOne}`;
  assert.deepEqual(ticket.get('requestValues'), [checkbox_ticket_value, TD.requestOne]);
  assert.equal(ticket.get('request'), requestValue);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  assert.equal(ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  let dtd_payload = DTF.generate(DT.idTwo, '', FD.idTwo, FD.labelTwo);
  const link = dtd.get('links').objectAt(0);
  // dt_path object added based on
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['options'] = [OD.idOne];
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelOne}: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('dt_path')[1]['dtd']['id'], DT.idOne);
  assert.equal(ticket.get('dt_path')[1]['ticket']['request'], requestValue);
  assert.equal(ticket.get('dt_path')[1]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['status'], TD.statusOneId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['priority'], TD.priorityOneId);
  assert.deepEqual(ticket.get('dt_path')[1]['dtd']['id'], DT.idOne);
  assert.deepEqual(ticket.get('dt_path')[1]['dtd']['fields'][0]['options'], [OD.idOne]);
  assert.deepEqual(ticket.get('request'), requestValue);
  assert.equal(dtPage.label.split(' ')[0], FD.labelTwo);
  // check checkbox to ensure field and option was put into fieldsObj in patch callback in controller
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
});

test('updating field text (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${FD.labelOne}: ${OD.textOne}, ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelOne}: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field text no label (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = undefined;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${OD.textOne}, ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = undefined;
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field number (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeTwo;
  detail_data['fields'][0]['label'] = FD.labelTwo;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-number:eq(0)', 92);
  const NUMBER = {keyCode: 57};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUMBER);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${FD.labelTwo}: 92, ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelTwo;
  mod_dt_one['dtd']['fields'][0]['value'] = "92";
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelTwo}: 92, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field textarea (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${FD.labelThree}: ${OD.textOne}, ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelThree;
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelThree}: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('updating field select (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeFour;
  detail_data['fields'][0]['label'] = FD.labelFour;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await page.selectClickDropdown()
    .selectOneOption();
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${FD.labelFour}: ${OD.textOne}, ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeFour);
  assert.equal(page.selectOneValue, `${OD.textOne} ${$('<div>&times;</div>').html()}`);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelFour;
  mod_dt_one['dtd']['fields'][0]['options'] = [OD.idOne];
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelFour}: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can\'t click to next destination if field is required (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await fillIn('.t-dtd-field-textarea:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  const requestValue = `${FD.labelThree}: ${OD.textOne}, ${TD.requestOne}`;
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelThree;
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelThree}: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination if field is not required and don\'t fill in field value (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  detail_data['fields'][0]['required'] = FD.requiredOne;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelThree;
  mod_dt_one['dtd']['fields'][0]['value'] = '';
  mod_dt_one['dtd']['fields'][0]['required'] = FD.requiredOne;
  const ticket = store.find('ticket', TD.idOne);
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: TD.requestOne };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
  assert.deepEqual(ticket.get('request'), TD.requestOne);
});

test('can click to next destination after updating multiple fields (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = FD.labelFour;
  detail_data.fields.push({
    id: FD.idTwo,
    label: 'another',
    type: FD.typeOne,
    required: FD.requiredTwo,
    order: FD.orderOne,
    options: [{
      id: OD.idOne,
      text: OD.textOne,
      order: OD.orderOne
    }]
  });
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  assert.equal(dtd.get('fields').objectAt(1).get('type'), FD.typeOne);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  await fillIn('.t-dtd-field-text:eq(1)', OD.textOne);
  const LETTER_S = {keyCode: 83};
  await triggerEvent('.t-dtd-field-text:eq(1)', 'keyup', LETTER_W);
  const requestValue = `${FD.labelFour}: ${OD.textOne}`, requestValueTwo = `another: ${OD.textOne}, ${TD.requestOne}`;
  let dtd_payload = DTF.generate(DT.idTwo);
  const joinedRequest = `${requestValue}, ${requestValueTwo}`;
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelFour;
  mod_dt_one['dtd']['fields'].splice(1, 0, {'id':FD.idTwo,'label':'another','value':OD.textOne,'required':FD.requiredTwo});
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelFour}: ${OD.textOne}, another: ${OD.textOne}, working`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: joinedRequest };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('fill out: number, text, textarea, and select (patch ticket)', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  // checkbox
  dtPage.fieldOneCheckboxCheck();
  // number
  await fillIn('.t-dtd-field-number:eq(0)', 92);
  const NUMBER = {keyCode: 57};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUMBER);
  // text
  await fillIn('.t-dtd-field-text:eq(0)', OD.textOne);
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  // textarea
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', '123 St.');
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${FD.labelOne}: yes, ${FD.labelFour}: ${OD.textOne}, ${FD.labelTwo}: 92, ${FD.labelThree}: 123 St., ${TD.requestOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeSix);
  assert.deepEqual(ticket.get('dt_path').length, 1);
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionOne));
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['label'] = FD.labelOne;
  mod_dt_one['dtd']['fields'].splice(1, 0, {'id': FD.idFour,'label': FD.labelFour,'value': OD.textOne,'required': FD.requiredTwo});
  mod_dt_one['dtd']['fields'].splice(2, 0, {'id': FD.idTwo,'label': FD.labelTwo,'value': '92','required': FD.requiredTwo});
  mod_dt_one['dtd']['fields'].splice(3, 0, {'id': FD.idThree,'label': FD.labelThree,'value': '123 St.','required': FD.requiredTwo});
  mod_dt_one['dtd']['fields'][0]['options'] = [OD.idOne];
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':requestValue,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
  assert.deepEqual(ticket.get('dt_path').length, 2);
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionOne));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionOne));
  assert.deepEqual(ticket.get('dt_path')[1]['dtd']['fields'][0]['options'], [OD.idOne]);
  assert.deepEqual(ticket.get('request'), requestValue);
});

// test('if dt_path length is 1 and deep link, wont push another dt_path object in (deep linking from old decision tree)', async assert => {
//   let detail_data = DTF.detailWithAllFields(DT.idOne);
//   returned_ticket.dt_path[0]['dtd'] = {id: DT.idOne, description: 'Start', fields: []};
//   const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
//   await visit(DETAIL_URL);
//   assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
//   assert.ok(find('.t-ticket-breadcrumb-back:eq(0)').hasClass('active'));
//   let dtd_payload = DTF.generate(DT.idTwo);
//   const link = dtd.get('links').objectAt(0);
//   let ticket_payload = { id: TD.idOne, request: TD.requestOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
//   xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
//   await page.clickNextBtn();
//   return pauseTest();
//   const ticket = store.find('ticket', TD.idOne);
//   assert.equal(ticket.get('dt_path').length, 1);
// });

test('will show breadcrumbs if description present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: 'Start'};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
});

test('will show breadcrumbs if prompt present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, prompt: DT.promptOne};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.promptOne));
});

test('will show breadcrumbs if note present', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, note: DT.noteOne};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.noteOne));
});

test('visit step 1 url, go back to step 0, then go back to 1 url after updating some info (checkbox)', async assert => {
  //DTD idOne
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idTwo, label: FD.labelTwo, value: 23, required: true }] };
  returned_ticket.priority_fk = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['priority'] = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 23`;
  returned_ticket.request = `${FD.labelTwo}: 23`;

  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.descriptionStart));

  // snapshot of step 0 info DT.idThree
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('request'), `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  const field = store.find('field', FD.idTwo);
  assert.equal(field.get('displayValue'), 23);

  // click checkbox on on DTD.idOne and should add OD.textOne to request field
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23`);

  // DTD previous data with an extra link
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  detail_data_3.fields = [{
      id: FD.idTwo,
      label: FD.labelTwo,
      type: FD.typeTwo,
      required: FD.requiredOne,
      order: FD.orderOne,
      options: []
  }];
  detail_data_3.links[0].text = LINK.textThree;
  detail_data_3.links[0].priority_fk = LINK.priorityTwo;
  detail_data_3.links[0].destination = {id: DT.idOne};
  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo});
  // Go back to idThree
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  returned_ticket.request = `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  assert.equal(currentURL(), DETAIL_URL);
  await click('.t-ticket-breadcrumb-back');
  assert.equal(currentURL(), DTD_THREE_URL);

  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);

  // click checkbox off on DTD.idThree so removing OD.textTwo from ticket request and updating dt_path
  assert.equal(find('.t-dtd-field-number').val(), 23);
  await fillIn('.t-dtd-field-number', 24);
  const NUM2 = {keyCode: 50};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUM2);
  assert.equal(find('.t-dtd-field-number').val(), 24);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 24`);

  //Go back to idOne which should have checkbox still checked
  let dtd_payload = DTF.generate(DT.idOne);
  const link = dtd.get('links').objectAt(0);

  let updated_dt_path = Ember.$.extend(true, [], dt_path);
  // update ticket request and dtd fields value
  updated_dt_path[0]['dtd']['fields'][0]['value'] = '24';
  updated_dt_path[0]['dtd']['fields'][0]['required'] = FD.requiredOne;
  updated_dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 24`;
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: updated_dt_path, request: `${FD.labelTwo}: 24` };
  xhr(BAIL_TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await click('.t-dtd-preview-btn:eq(0)');
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 24`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
});

test('visit 1 url, go back to step 0, then go back to 1 url after updating some info (select)', async assert => {
  //DTD idOne
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idRandom, label: FD.labelSelect, value: OD.fieldTypeSelectValue, required: FD.requiredTwo, options: [OD.idRando] }] };
  returned_ticket.priority_fk = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['priority'] = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['request'] = `${FD.labelSelect}: ${OD.fieldTypeSelectValue}`;
  returned_ticket.request = `${FD.labelSelect}: ${OD.fieldTypeSelectValue}`;

  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.descriptionStart));

  // snapshot
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('request'), `${FD.labelSelect}: ${OD.fieldTypeSelectValue}`);
  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelSelect}: ${OD.fieldTypeSelectValue}`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  const field = store.find('field', FD.idFour);
  // assert.equal(field.get('displayValue'), OD.fieldTypeSelectValue);

  // click checkbox on on DTD.idOne and should add OD.textOne to request field
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelSelect}: ${OD.fieldTypeSelectValue}`);

  // DTD previous data with an extra link
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  detail_data_3.fields = [{
      id: FD.idRandom,
      label: FD.labelSelect,
      type: FD.typeFour,
      required: FD.requiredTwo,
      order: FD.orderOne,
      options: [{ id: OD.idRando2, text: OD.textOne, order: OD.orderOne }, { id: OD.idRando, text: OD.fieldTypeSelectValue, order: OD.orderTwo }]
  }];
  detail_data_3.links[0].text = LINK.textThree;
  detail_data_3.links[0].priority_fk = LINK.priorityTwo;
  detail_data_3.links[0].destination = {id: DT.idOne};
  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo});
  // Go back to idThree and set request to new value coming from server
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  returned_ticket.request = `${FD.labelOne}: ${OD.textOne}, ${FD.labelSelect}: ${OD.fieldTypeSelectValue}`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  assert.equal(currentURL(), DETAIL_URL);
  await click('.t-ticket-breadcrumb-back');
  assert.equal(currentURL(), DTD_THREE_URL);

  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelSelect}: ${OD.fieldTypeSelectValue}`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelSelect}: ${OD.fieldTypeSelectValue}`);

  // select diff select on DTD.idThree but first cleaer out current and ensure ticket req is updated
  assert.equal(page.fieldOptionSelected, OD.fieldTypeSelectValue);
  await click('.ember-power-select-clear-btn');
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}`);
  await selectChoose('.t-dtd-field-select', OD.textOne);
  assert.equal(page.fieldOptionSelected, OD.textOne);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelSelect}: ${OD.textOne}`);

  //Go back to idOne which should have checkbox still checked
  const link = dtd.get('links').objectAt(0);
  let updated_dt_path = Ember.$.extend(true, [], dt_path);
  updated_dt_path[0]['dtd']['fields'][0]['value'] = OD.textOne;
  updated_dt_path[0]['dtd']['fields'][0]['options'] = [OD.idRando2];
  updated_dt_path[0]['ticket']['request'] = `${FD.labelSelect}: ${OD.textOne}`;
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: updated_dt_path, request: `${FD.labelSelect}: ${OD.textOne}` };
  let dtd_payload = DTF.generate(DT.idOne);
  xhr(BAIL_TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await click('.t-dtd-preview-btn:eq(0)');
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('dt_path').length, 1);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelSelect}: ${OD.textOne}`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
});

test('visit 2 url, go back to step 0, then go back to 1 url after updating some info (input/text area) should keep info around and update ticket request', async assert => {
  // DT.idOne is 3rd
  // DT.idTwo is 2nd
  // DT.idThree is 1st (Start)
  // Note: fields and options are completely separate
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idTwo, label: FD.labelTwo, value: 23, required: true }] };
  returned_ticket.priority_fk = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['priority'] = LINK.priorityTwo;
  //old ticket request state
  returned_ticket.dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 23`;
  //current ticket state
  returned_ticket.request = `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`;
  //previous ticket (which has same request value as current) and dt state
  returned_ticket.dt_path.push({ticket: {id: TD.idOne, request: `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`}, dtd: {id: DT.idTwo, description: DT.descriptionTwo,
                               fields: [{ id: FD.idRandom, label: FD.labelRandom, value: 'Im second', required: true }]}});

  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);

  // snapshot of Start && Middle
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);

  // click checkbox on on DTD.idOne and should add OD.textOne to request field
  assert.equal(updated_ticket.get('request'), `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);

  // DTD start data with an extra link
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  detail_data_3.fields = [{
      id: FD.idTwo,
      label: FD.labelTwo,
      type: FD.typeTwo,
      required: FD.requiredOne,
      order: FD.orderOne,
      options: []
  }];
  detail_data_3.links[0].text = LINK.textThree;
  detail_data_3.links[0].priority_fk = LINK.priorityTwo;
  // Destination is step 1 which is DT.idTwo
  detail_data_3.links[0].destination = {id: DT.idTwo};
  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo});
  // Go back to idThree which is 2 back from where we were at
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  returned_ticket.request = `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  assert.equal(currentURL(), DETAIL_URL);
  await click('.t-ticket-breadcrumb-back');
  //Breadcrumbs should be the same
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);
  assert.equal(currentURL(), DTD_THREE_URL);

  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  //TODO: this needs to be in order
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);

  // Update age and expect request to be updated and dt_path[0][ticket][request] to be updated after clicking link in dtPathMunge function
  assert.equal(find('.t-dtd-field-number').val(), 23);
  await fillIn('.t-dtd-field-number', 24);
  const NUM2 = {keyCode: 50};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUM2);
  assert.equal(find('.t-dtd-field-number').val(), 24);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 24, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);

  //Go back to idTwo which should have Im second filled in
  let updated_dt_path = Ember.$.extend(true, [], dt_path);
  // update ticket request and dtd fields value
  updated_dt_path[0]['dtd']['fields'][0]['value'] = '24';
  updated_dt_path[0]['dtd']['fields'][0]['required'] = FD.requiredOne;
  updated_dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 24`;
  // updated_dt_path[1]['dtd']['fields'][0]['value'] = 'Im second';
  updated_dt_path[1]['dtd']['fields'][0]['required'] = FD.requiredTwo;
  updated_dt_path[1]['ticket']['request'] = `${FD.labelTwo}: 24, ${FD.labelRandom}: Im second`;
  // DTD.idTwo has FD.labelRandom w/ field value of Im second
  let dtd_payload = DTF.generate(DT.idTwo, '', FD.idRandom, FD.labelRandom);
  dtd_payload['fields'][0]['type'] = FD.typeOne;
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: updated_dt_path, request: `${FD.labelTwo}: 24, ${FD.labelRandom}: Im second` };
  const DT_IDTWO_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
  xhr(DT_IDTWO_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await click('.t-dtd-preview-btn:eq(0)');
  assert.equal(currentURL(), DTD_TWO_URL);
  //Breadcrumbs should be the same
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);
  assert.equal(updated_ticket.get('dt_path').length, 2);
  // assert.equal(updated_ticket.get('dt_path')[1]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 24`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelTwo}: 24, ${FD.labelRandom}: Im second`);
  assert.equal(find('.t-dtd-field-preview').val(), 'Im second');
});

test('visit 2 url, go back to step 0, then go back to 1 url after updating some info (checkbox) should keep info around and update ticket request', async assert => {
  // DT.idOne is 3rd
  // DT.idTwo is 2nd
  // DT.idThree is 1st (Start) - w/ fields and options array of ids that were selected
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idRandom2, label: FD.labelFour, value: OD.textOne, required: true, options: [OD.idRando] }] };
  returned_ticket.priority_fk = LINK.priorityTwo;
  returned_ticket.dt_path[0]['ticket']['priority'] = LINK.priorityTwo;
  //old ticket request state
  returned_ticket.dt_path[0]['ticket']['request'] = `${FD.labelFour}: ${OD.textOne}`;
  //current ticket state
  returned_ticket.request = `${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`;
  //previous ticket (which has same request value as current) and dt state
  returned_ticket.dt_path.push({ticket: {id: TD.idOne, request: `${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`}, dtd: {id: DT.idTwo, description: DT.descriptionTwo,
                               fields: [{ id: FD.idRandom, label: FD.labelRandom, value: 'Im second', required: true }]}});

  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);

  // snapshot of Start && Middle
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelFour}: ${OD.textOne}`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`);

  // click checkbox on on DTD.idOne and should add OD.textOne to request field
  assert.equal(updated_ticket.get('request'), `${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`);
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`);

  // DTD start data with an extra link.  OD.idOne is checked 'yes' with random ids so that doesnt clash with previous dtd field and option models
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  detail_data_3.fields = [{
      id: FD.idRandom2,
      label: FD.labelFour,
      type: FD.typeSix,
      required: FD.requiredOne,
      order: FD.orderOne,
      options: [{ id: OD.idRando, text: OD.textOne, order: OD.orderOne }, { id: OD.idRando2, text: OD.textTwo, order: OD.orderTwo }]
  }];
  detail_data_3.links[0].text = LINK.textThree;
  detail_data_3.links[0].priority_fk = LINK.priorityTwo;
  // Destination is step 1 which is DT.idTwo
  detail_data_3.links[0].destination = {id: DT.idTwo};
  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo});
  // Go back to idThree which is 2 back from where we were at
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  returned_ticket.request = `${FD.labelOne}: ${OD.textOne}, ${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  assert.equal(currentURL(), DETAIL_URL);
  await click('.t-ticket-breadcrumb-back');
  //Breadcrumbs should be the same
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);
  assert.equal(currentURL(), DTD_THREE_URL);

  // Uncheck value so options in dt_path[0] == undefined
  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelFour}: ${OD.textOne}`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelFour}: ${OD.textOne}, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  // ticket request removes fields label: value
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelRandom}: Im second`);
  // dt_path still has ticket request
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelFour}: ${OD.textOne}`);

  //Go back to idOne which should have Im second filled in
  let updated_dt_path = Ember.$.extend(true, [], dt_path);
  // update ticket request and dtd fields value
  updated_dt_path[0]['dtd']['fields'][0]['value'] = '';
  updated_dt_path[0]['dtd']['fields'][0]['required'] = FD.requiredOne;
  updated_dt_path[0]['dtd']['fields'][0]['options'] = [];
  updated_dt_path[0]['ticket']['request'] = '';
  updated_dt_path[1]['dtd']['fields'][0]['value'] = 'Im second';
  updated_dt_path[1]['ticket']['request'] = `${FD.labelRandom}: Im second`;
  let dtd_payload = DTF.generate(DT.idTwo, '', FD.idRandom, FD.labelRandom);
  dtd_payload['fields'][0]['type'] = FD.typeOne;
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: updated_dt_path, request: `${FD.labelRandom}: Im second` };
  const DT_IDTWO_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
  xhr(DT_IDTWO_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await click('.t-dtd-preview-btn:eq(0)');
  assert.equal(currentURL(), DTD_TWO_URL);
  // Breadcrumbs should be the same
  assert.equal(page.breadcrumbOne, substringBreadcrumb(DT.descriptionStart));
  assert.equal(page.breadcrumbTwo, substringBreadcrumb(DT.descriptionTwo));
  assert.equal(find('.t-dt-breadcrumb > .t-breadcrumb-list').length, 2);
  assert.equal(updated_ticket.get('dt_path').length, 2);
  // assert.equal(updated_ticket.get('dt_path')[1]['ticket']['priority'], LINK.priorityTwo);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], '');
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelRandom}: Im second`);
  assert.equal(find('.t-dtd-field-preview').val(), 'Im second');
});

test('visit 2 url, go back to step 0, then go a different route should save ticket request and blow away dt_path ahead of step 0', async assert => {
  // DTD idOne is 3rd
  // DTD idThree is 1st
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idTwo, label: FD.labelTwo, value: 23, required: FD.requiredOne }] };
  //old ticket requeset state
  returned_ticket.dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 23`;
  //current ticket state
  returned_ticket.request = `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`;
  //previous ticket (which has same request value as current) and dt state
  returned_ticket.dt_path.push({ticket: {id: TD.idOne, request: `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`, priority: TD.priorityZeroId, status: TD.statusZeroId}, dtd: {id: DT.idTwo, description: DT.descriptionTwo,
                               fields: [{ id: FD.idRandom, label: FD.labelRandom, value: 'Im second', required: true }]}});

  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim().split('  ')[0].trim(), substringBreadcrumb(DT.descriptionStart));
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim().split('  ').slice(-1)[0], substringBreadcrumb(DT.descriptionTwo));

  // snapshot of Start && Middle
  const updated_ticket = store.find('ticket', TD.idOne);
  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['status'], TD.statusZeroId);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['priority'], TD.priorityZeroId);

  // click checkbox on on DTD.idOne and should add OD.textOne to request field
  assert.equal(updated_ticket.get('request'), `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
  await dtPage.fieldOneCheckboxCheck();
  assert.ok(dtPage.fieldOneCheckboxIsChecked());
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);

  // DTD start data with an extra link
  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
  detail_data_3.fields = [{
      id: FD.idTwo,
      label: FD.labelTwo,
      type: FD.typeTwo,
      required: FD.requiredOne,
      order: FD.orderOne,
      options: []
  }];
  detail_data_3.links[0].text = LINK.textThree;
  detail_data_3.links[0].destination = {id: DT.idOne};
  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo, destination: {id: DT.idGridTwo}});
  // Go back to idThree which is 2 back from where we were at
  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
  returned_ticket.request = `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`;
  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
  assert.equal(currentURL(), DETAIL_URL);
  await click('.t-ticket-breadcrumb-back');
  assert.equal(currentURL(), DTD_THREE_URL);

  assert.equal(updated_ticket.get('dt_path').length, 2);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  //TODO: this needs to be in order
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['request'], `${FD.labelTwo}: 23, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['status'], TD.statusZeroId);
  assert.equal(updated_ticket.get('dt_path')[1]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);

  // Update age and expect request to be updated and dt_path[0][ticket][reqeust] to be updated after clicking link in dtPathMunge function
  assert.equal(find('.t-dtd-field-number').val(), 23);
  await fillIn('.t-dtd-field-number', 24);
  const NUM2 = {keyCode: 50};
  await triggerEvent('.t-dtd-field-number:eq(0)', 'keyup', NUM2);
  assert.equal(find('.t-dtd-field-number').val(), 24);
  assert.equal(updated_ticket.get('request'), `${FD.labelOne}: ${OD.textOne}, ${FD.labelTwo}: 24, ${FD.labelRandom}: Im second`);
  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `${FD.labelTwo}: 23`);


  //Go to idGridTwo and dt_path[1] is wiped out
  let dtd_payload = DTF.generate(DT.idGridTwo);
  const link = dtd.get('links').objectAt(0);
  let updated_dt_path = [dt_path[0]];
  // update ticket request and dtd fields value
  updated_dt_path[0]['dtd']['fields'][0]['value'] = '24';
  updated_dt_path[0]['ticket']['request'] = `${FD.labelTwo}: 24`;
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusTwo, categories: [], dt_path: updated_dt_path, request: `${FD.labelTwo}: 24` };
  const GRID_TWO_TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idGridTwo}/ticket/`;
  xhr(GRID_TWO_TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await click('.t-dtd-preview-btn:eq(1)');
  const DTD_GRIDTWO_URL = `${BASE_URL}/${DT.idGridTwo}/ticket/${TD.idOne}`;
  assert.equal(currentURL(), DTD_GRIDTWO_URL);
});

test('submit dtd (w/ empty destination) will patch ticket and navigate to dt.endpage route', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['links'][0]['destination'] = undefined;
  detail_data['links'][0]['text'] = LINK.textSubmit;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  dtPage.fieldOneCheckboxCheck();
  assert.equal(page.previewButtonOne, t('dt.link.submit'));
  const requestValue = `${FD.labelOne}: ${OD.textOne}, ${TD.requestOne}`;
  let ticket_return_payload = TF.detail();
  const link = dtd.get('links').objectAt(0);
  const ticket = store.find('ticket', TD.idOne);
  let mod_dt_one = Ember.$.extend(true, {}, dt_one);
  mod_dt_one['dtd']['fields'][0]['options'] = [OD.idOne];
  const mock_dt_path = [...dt_path,
    {'ticket':{'id':TD.idOne,'requester':'Mel1 Gibson1','location': LD.idOne,
      'status':TD.statusOneId,'priority':TD.priorityOneId,
      'request':`${FD.labelOne}: ${OD.textOne}, ${TD.requestOne}`,'categories':[...ticket.get('categories_ids')],
      'cc':['139543cf-8fea-426a-8bc3-09778cd79901'],'attachments':[]},
      ...mod_dt_one}];
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), dt_path: mock_dt_path, request: requestValue };
  let ticket_server = TF.detail();
  xhr(TICKET_SUBMIT_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, ticket_server);
  await page.clickNextBtn();
  assert.equal(currentURL(), ENDPAGE_URL);
});

//test('navigating away from start page will save data', async assert => {
//  let detail_data = DTF.detailWithAllFields(DT.idOne);
//  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: 'Start'};
//  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
//  await visit(DETAIL_URL);
//  // checkbox
//  await dtPage.fieldOneCheckboxCheck();
//  const updated_ticket = store.find('ticket', TD.idOne);
//  const requestValue = `${FD.labelOne}: ${OD.textOne}`;
//  assert.equal(updated_ticket.get('request'), requestValue);
//  assert.deepEqual(updated_ticket.get('requestValues'), [`${FD.labelOne}: ${OD.textOne}`]);
//  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
//  assert.equal(updated_ticket.get('dt_path').length, 1);
//  //Ticket PATCH
//  let dtd_payload = DTF.generate(DT.idTwo);
//  let ticket_payload = { id: TD.idOne, request: requestValue };
//  xhr(BAIL_TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
//  //Ticket GET
//  xhr(`${PREFIX}${TICKET_URL}/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
//  await visit(TICKET_DETAIL_URL);
//  assert.equal(currentURL(), `${TICKET_URL}/${TD.idOne}`);
//  assert.equal(updated_ticket.get('dt_path').length, 2);
//  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
//  assert.equal(updated_ticket.get('dt_path')[1]['dtd']['id'], DT.idOne);
//});

//multiple pages

/* jshint ignore:end */
