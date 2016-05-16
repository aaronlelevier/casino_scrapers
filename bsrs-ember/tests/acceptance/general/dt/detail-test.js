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
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
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
const DTD_THREE_URL = `${BASE_URL}/${DT.idThree}/ticket/${TD.idOne}`;
const TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;
const BAIL_TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idOne}/ticket/`;

let application, store, endpoint, original_uuid, link, dtd, dt_path, returned_ticket;

module('Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/${DT.idOne}/ticket/?ticket=${TD.idOne}`;
    dtd = store.find('dtd', DT.idOne);
    original_uuid = random.uuid;
    random.uuid = function() { return TD.idOne; };
    /*
     * ticket object is used for current ticket and dt_path object
     * dt_path is previous state of ticket && dtd state
     * returned_ticket is the ticket w/ the dt_path, which will be different and is returned on a get requests
     * all tests are assuming deep linking (i.e. clicking from ticket detail)
     * dt_path dtd has idThree by chance.  Just need to give it something
     */
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
        id: DT.idThree
      }
    }];
    returned_ticket = TF.detail(TD.idOne, null, dt_path);
    run(() => {
      store.push('ticket', {id: ticket.id});
    });
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('decision tree displays data and can click to next destination after updating option (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data.fields[0].required = true;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await page.fieldClickCheckboxOne();
  assert.notOk(find('.t-dtd-preview-btn').attr('disabled'));
  const ticket = store.find('ticket', TD.idOne);
  const checkbox_ticket_value = `${FD.labelOne}: ${OD.textOne}`
  const requestValue = `${TD.requestOne}, ${checkbox_ticket_value}`;
  assert.deepEqual(ticket.get('requestValues'), [TD.requestOne, checkbox_ticket_value]);
  assert.equal(ticket.get('request'), requestValue);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idOne);
  assert.equal(ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  assert.equal(ticket.get('dt_path')[0]['ticket']['priority'], TD.priorityZeroId);
  assert.equal(ticket.get('status.id'), TD.statusOneId);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
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
});

test('updating field text (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelOne}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
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
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
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
  const requestValue = `${TD.requestOne}, ${FD.labelTwo}: 92`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
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
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelThree}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
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
  const requestValue = `${TD.requestOne}, ${FD.labelFour}: ${OD.textOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeFour);
  assert.equal(page.selectOneValue, OD.textOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: requestValue };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can\'t click to next destination if field is required (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeThree;
  detail_data['fields'][0]['label'] = FD.labelThree;
  detail_data['fields'][0]['required'] = FD.requiredTwo;
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  assert.ok(find('.t-dtd-preview-btn').attr('disabled'));
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  await fillIn('.t-dtd-field-textarea:eq(0)', 'wats');
  const LETTER_S = {keyCode: 83};
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_S);
  assert.equal(find('.t-dtd-preview-btn').attr('disabled'), undefined);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  const requestValue = `${TD.requestOne}, ${FD.labelThree}: wats`;
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: TD.requestOne };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('can click to next destination after updating multiple fields select (patch ticket)', async assert => {
  const detail_data = DTF.detail(DT.idOne);
  detail_data['fields'][0]['type'] = FD.typeOne;
  detail_data['fields'][0]['label'] = FD.labelFour;
  detail_data.fields.push({
    id: FD.idTwo,
    label: 'another',
    type: FD.typeOne,
    required: FD.requiredOne,
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
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  await fillIn('.t-dtd-field-text:eq(1)', 'sat');
  const LETTER_S = {keyCode: 83};
  await triggerEvent('.t-dtd-field-text:eq(1)', 'keyup', LETTER_W);
  const requestValue = `${TD.requestOne}, ${FD.labelFour}: wat`, requestValueTwo = 'another: sat'; 
  let dtd_payload = DTF.generate(DT.idTwo);
  const joinedRequest = `${requestValue}, ${requestValueTwo}`;
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: joinedRequest };
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
  await fillIn('.t-dtd-field-text:eq(0)', 'wat');
  const LETTER_W = {keyCode: 87};
  await triggerEvent('.t-dtd-field-text:eq(0)', 'keyup', LETTER_W);
  // textarea
  assert.equal(currentURL(), DETAIL_URL);
  await fillIn('.t-dtd-field-textarea:eq(0)', '123 St.');
  await triggerEvent('.t-dtd-field-textarea:eq(0)', 'keyup', LETTER_W);
  const ticket = store.find('ticket', TD.idOne);
  const requestValue = `${TD.requestOne}, ${FD.labelOne}: yes, ${FD.labelFour}: wat, ${FD.labelTwo}: 92, ${FD.labelThree}: 123 St.`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeSix);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});

test('if dt_path length is 1 and deep link, wont push another dt_path object in (deep linking from old decision tree)', async assert => {
  let detail_data = DTF.detailWithAllFields(DT.idOne);
  returned_ticket.dt_path[0]['dtd'] = {id: DT.idOne, description: 'Start'};
  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
  await visit(DETAIL_URL);
  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb('Start'));
  assert.ok(find('.t-ticket-breadcrumb-back:eq(0)').hasClass('active'));
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: TD.requestOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('dt_path').length, 1);
});

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

//test('scott visit 1 url, go back to 0, then go back to 1 url after updating some info (same field)', async assert => {
//  //DTD idOne
//  let detail_data = DTF.detailWithAllFields(DT.idOne);
//  //DT.idThree in dt_path should have fields and options if value was set 
//  //DT.idThree has same fields and options as DT.idOne which presents a problem so only set isChecked and displayValue if current dtd id === id in dt_path, which means the user went backwards
//  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: DT.descriptionStart, fields: [{ id: FD.idOne, value: 'filled in field', options: [OD.idTwo] }] };
//  returned_ticket.priority_fk = LINK.priorityTwo;
//  returned_ticket.dt_path[0]['ticket']['priority'] = LINK.priorityTwo;
//  returned_ticket.dt_path[0]['ticket']['request'] = `name: ${OD.textTwo}`;
//  returned_ticket.request = `name: ${OD.textTwo}`;

//  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
//  await visit(DETAIL_URL);
//  assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.descriptionStart));

//  //snapshot
//  const updated_ticket = store.find('ticket', TD.idOne);
//  assert.equal(updated_ticket.get('request'), `name: ${OD.textTwo}`);
//  assert.equal(updated_ticket.get('dt_path').length, 1);
//  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
//  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `name: ${OD.textTwo}`);
//  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
//  //previous dtd stored values that get transformed to store field and option instances to display values if navigate back
//  const field = store.find('field', FD.idOne);
//  assert.equal(field.get('displayValue')['dtd_id'], DT.idThree);
//  assert.equal(field.get('displayValue')['value'], 'filled in field');
//  const option = store.find('option', OD.idTwo);
//  assert.equal(option.get('isCheckedObj')['dtd_id'], DT.idThree);
//  assert.equal(option.get('isCheckedObj')['value'], true);

//  // click checkbox off on DTD.idOne
//  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
//  await dtPage.fieldOneCheckboxCheck();
//  assert.ok(dtPage.fieldOneCheckboxIsChecked());
//  assert.equal(updated_ticket.get('request'), `name: ${OD.textTwo}, name: ${OD.textOne}`);

//  //DTD previous data with an extra link
//  const detail_data_3 = DTF.detailWithAllFields(DT.idThree);
//  detail_data_3.fields.splice(-3);
//  detail_data_3.fields[0].options = [{id: OD.idTwo, text: OD.textTwo, order: OD.orderOne}];
//  detail_data_3.links[0].text = LINK.textThree;
//  detail_data_3.links[0].priority_fk = LINK.priorityTwo;
//  detail_data_3.links[0].destination = {id: DT.idOne};
//  detail_data_3.links.push({id: LINK.idTwo, text: 'wat', status_fk: LINK.statusTwo, priority_fk: LINK.priorityTwo});
//  //Go back to idThree
//  const endpoint_3 = `${PREFIX}${BASE_URL}/${DT.idThree}/ticket/?ticket=${TD.idOne}`;
//  xhr(endpoint_3, 'GET', null, {}, 200, {dtd: detail_data_3, ticket: returned_ticket});
//  assert.equal(currentURL(), DETAIL_URL);
//  await click('.t-ticket-breadcrumb-back');
//  assert.equal(currentURL(), DTD_THREE_URL);

//  //snapshot with idOne not in there yet but checkbox for 'no' on idThree is checked
//  assert.equal(updated_ticket.get('dt_path').length, 1);
//  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
//  //TODO: this will be updated when uncheck 'no'
//  assert.equal(updated_ticket.get('request'), `name: ${OD.textTwo}, name: ${OD.textOne}`);
//  assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `name: ${OD.textTwo}`);
//  assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);

//  // click checkbox off on DTD.idThree
//  assert.ok(dtPage.fieldOneCheckboxIsChecked());
//  await dtPage.fieldOneCheckboxCheck();
//  assert.notOk(dtPage.fieldOneCheckboxIsChecked());
//  assert.equal(updated_ticket.get('request'), `name: ${OD.textOne}`);

//  ////Go back to idOne which should have checkbox still checked
//  //let dtd_payload = DTF.generate(DT.idOne);
//  //const link = dtd.get('links').objectAt(0);
//  //let ticket_payload = { id: TD.idOne, priority: LINK.priorityTwo, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id'), request: `${TD.requestOne}, name: ${OD.textOne}` };
//  //xhr(BAIL_TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
//  //await click('.t-dtd-preview-btn:eq(0)');
//  //assert.ok(dtPage.fieldOneCheckboxIsChecked());
//  //assert.equal(updated_ticket.get('dt_path').length, 1);
//  //assert.equal(updated_ticket.get('dt_path')[0]['ticket']['priority'], LINK.priorityTwo);
//  //assert.equal(updated_ticket.get('dt_path')[0]['ticket']['request'], `name: ${OD.textTwo}`);
//  //assert.equal(updated_ticket.get('dt_path')[0]['dtd']['id'], DT.idThree);
  
//  // assert.equal(find('.t-dt-breadcrumb:eq(0)').text().trim(), substringBreadcrumb(DT.descriptionStart));
//  // assert.ok(dtPage.fieldOneCheckboxIsChecked());
  
//  //xhr(`${PREFIX}${TICKET_URL}/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
//  //xhr(`${PREFIX}${TICKET_URL}/${TD.idOne}/`, 'GET', null, {}, 200, TF.detail(TD.idOne));
//  //await visit(TICKET_DETAIL_URL);
//});

//test('navigating away from start page will save data', async assert => {
//  let detail_data = DTF.detailWithAllFields(DT.idOne);
//  returned_ticket.dt_path[0]['dtd'] = {id: DT.idThree, description: 'Start'};
//  const detail_xhr = xhr(endpoint, 'GET', null, {}, 200, {dtd: detail_data, ticket: returned_ticket});
//  await visit(DETAIL_URL);
//  // checkbox
//  await dtPage.fieldOneCheckboxCheck();
//  const updated_ticket = store.find('ticket', TD.idOne);
//  const requestValue = `${TD.requestOne}, name: ${OD.textOne}`;
//  assert.equal(updated_ticket.get('request'), requestValue);
//  assert.deepEqual(updated_ticket.get('requestValues'), [TD.requestOne, `name: ${OD.textOne}`]);
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
