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
const DEST_URL = `${BASE_URL}/${DT.idTwo}/ticket/${TD.idOne}`;
const TICKET_PATCH_URL = `${PREFIX}/dt/${DT.idTwo}/ticket/`;

let application, store, endpoint, original_uuid, link, dtd, dt_path, returned_ticket;

module('Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/${DT.idOne}/ticket/?ticket=${TD.idOne}`;
    dtd = store.find('dtd', DT.idOne);
    original_uuid = random.uuid;
    random.uuid = function() { return TD.idOne; };
    const ticket = {
      id: TD.idOne,
      requester: TD.requesterOne,
      location: LD.idThree,
      status: TD.statusZeroId,
      priority: TD.priorityZeroId,
      categories: [],
      cc: [],
      attachments: [],
    };
    dt_path = [{
      ticket
    }];
    returned_ticket = TF.detail(TD.idOne, null, dt_path);
    run(() => {
      store.push('ticket', {id: ticket.id, location_fk: LD.idThree, status_fk: TD.statusZeroId, priority_fk: TD.priorityZeroId, new_pk: DT.idOne, dt_path});
      store.push('location', {id: LD.idThree, tickets: [ticket.id]});
      store.push('ticket-status', {id: TD.statusZeroId, tickets: [ticket.id]});
      store.push('ticket-priority', {id: TD.priorityZeroId, tickets: [ticket.id]});
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
  const requestValue = `${FD.labelOne}: ${OD.textOne}`;
  assert.deepEqual(ticket.get('requestValues'), [requestValue]);
  assert.equal(ticket.get('request'), requestValue);
  assert.equal(ticket.get('dt_path')[0]['dt_id'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idThree);
  assert.equal(ticket.get('dt_path')[0]['ticket']['status'], TD.statusZeroId);
  assert.equal(ticket.get('status.id'), TD.statusZeroId);
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
  assert.equal(ticket.get('dt_path')[0]['dt_id'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['request'], undefined);
  assert.equal(ticket.get('dt_path')[0]['ticket']['location'], LD.idThree);
  assert.equal(ticket.get('dt_path')[1]['dt_id'], DT.idOne);
  assert.equal(ticket.get('dt_path')[1]['ticket']['request'], requestValue);
  assert.equal(ticket.get('dt_path')[1]['ticket']['location'], LD.idThree);
  assert.equal(ticket.get('status.id'), TD.statusZeroId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['status'], TD.statusZeroId);
  assert.equal(ticket.get('dt_path')[1]['ticket']['priority'], TD.priorityZeroId);
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
  const requestValue = `${FD.labelOne}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `${FD.labelTwo}: 92`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeTwo);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `${FD.labelThree}: wat`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeThree);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `${FD.labelFour}: ${OD.textOne}`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeFour);
  assert.equal(page.selectOneValue, OD.textOne);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `${FD.labelThree}: wats`;
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
  let ticket_payload = { id: TD.idOne, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
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
  const requestValue = `${FD.labelFour}: wat`, requestValueTwo = 'another: sat'; 
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
  const requestValue = `${FD.labelOne}: yes, ${FD.labelFour}: wat, ${FD.labelTwo}: 92, ${FD.labelThree}: 123 St.`;
  assert.equal(dtd.get('links').objectAt(0).get('destination.id'), DT.idTwo);
  assert.equal(dtd.get('fields').objectAt(0).get('type'), FD.typeSix);
  let dtd_payload = DTF.generate(DT.idTwo);
  const link = dtd.get('links').objectAt(0);
  let ticket_payload = { id: TD.idOne, request: requestValue, priority: LINK.priorityOne, status: LINK.statusOne, categories: link.get('sorted_categories').mapBy('id') };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, dtd_payload);
  await page.clickNextBtn();
  assert.equal(currentURL(), DEST_URL);
});


//multiple pages

/* jshint ignore:end */
