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
import TICKET from 'bsrs-ember/vendor/defaults/ticket';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/dtd';
import generalPage from 'bsrs-ember/tests/pages/general';
import ticketPage from 'bsrs-ember/tests/pages/tickets';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_dt_url;//Routing
const DTD_URL = BASEURLS.base_dtd_url;//Request
const TICKET_URL = BASEURLS.base_tickets_url;//Ticket
const DETAIL_URL = `${BASE_URL}/${DT.idOne}`;
const DEST_URL = `${BASE_URL}/${DT.idTwo}`;
const TICKET_POST_URL = `${PREFIX}${TICKET_URL}/`;
const TICKET_PATCH_URL = `${PREFIX}${TICKET_URL}/${UUID.value}/`;
// const DT_PUT_URL = `${PREFIX}${DETAIL_URL}/`;
// const BACKSPACE = {keyCode: 8};
// const DT_ERROR_URL = BASEURLS.dtd_error_url;
// const PAGE_SIZE = config.APP.PAGE_SIZE;

let application, store, endpoint, list_xhr, detail_xhr, detail_data, original_uuid;

module('Acceptance | dt detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    endpoint = `${PREFIX}${DTD_URL}/`;
    detail_data = DTF.detail(DT.idOne);
    detail_xhr = xhr(`${endpoint}${DT.idOne}/`, 'GET', null, {}, 200, detail_data);
    original_uuid = random.uuid;
    random.uuid = function() { return UUID.value; };
  },
  afterEach() {
    random.uuid = original_uuid;
    Ember.run(application, 'destroy');
  }
});

/* jshint ignore:start */

test('decision tree displays data and can click to next destination (post ticket)', async assert => {
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  detail_data = DTF.detail(DT.idTwo);
  await page.fieldClickCheckboxOne();
  const ticket = store.find('ticket', UUID.value);
  assert.deepEqual(ticket.get('requestValues'), [OD.textOne]);
  assert.equal(ticket.get('request'), OD.textOne);
  //TODO: need to include location in here
  let ticket_payload = { id: UUID.value, request: OD.textOne, cc: [], categories: [], attachments: [] };
  xhr(TICKET_POST_URL, 'POST', JSON.stringify(ticket_payload), {}, 201, Ember.$.extend(true, {}, ticket_payload));
  xhr(`${endpoint}${DT.idTwo}/`, 'GET', null, {}, 200, detail_data);
  await page.clickNextBtn();
});

test('decision tree displays data and can click to next destination (patch ticket)', async assert => {
  run(() => {
    store.push('ticket', {id: UUID.value, new_pk: DT.idOne})
  });
  await visit(DETAIL_URL);
  assert.equal(currentURL(), DETAIL_URL);
  detail_data = DTF.detail(DT.idTwo);
  await page.fieldClickCheckboxOne();
  const ticket = store.find('ticket', UUID.value);
  assert.deepEqual(ticket.get('requestValues'), [OD.textOne]);
  assert.equal(ticket.get('request'), OD.textOne);
  let ticket_payload = { id: UUID.value, request: OD.textOne };
  xhr(TICKET_PATCH_URL, 'PATCH', JSON.stringify(ticket_payload), {}, 200, Ember.$.extend(true, {}, ticket_payload));
  xhr(`${endpoint}${DT.idTwo}/`, 'GET', null, {}, 200, detail_data);
  await page.clickNextBtn();
});

/* jshint ignore:end */
