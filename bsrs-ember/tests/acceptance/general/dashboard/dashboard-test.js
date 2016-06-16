import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import SD from 'bsrs-ember/vendor/defaults/setting';
import DTF from 'bsrs-ember/vendor/dtd_fixtures';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TA_FIXTURES from 'bsrs-ember/vendor/ticket_activity_fixtures';
import page from 'bsrs-ember/tests/pages/tickets';

var application, store, endpoint;

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;
const DASHBOARD_URL = BASEURLS.dashboard_url;

module('Acceptance | dashboard', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: SD.dashboard_text}});
    xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('welcome h1 header and dashboard_text from settings', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(find('.t-dashboard-text').text(), 'Welcome');
  });
});

/* jshint ignore:start */

test('draft tickets are shown and can click to ticket detail and start up decision tree', async assert => {
  await visit(DASHBOARD_URL);
  assert.equal(find('.t-ticket-draft').length, 10);
  const tickets = store.find('ticket-list')
  assert.equal(tickets.get('length'), 10);
  let endpoint = `${PREFIX}${BASE_URL}/`;
  detail_data = TF.detail(TD.idOne, TD.statusSevenId);
  xhr(`${endpoint}${TD.idOne}/`, 'GET', null, {}, 200, detail_data);
  xhr(`/api/tickets/${TD.idOne}/activity/`, 'GET', null, {}, 200, TA_FIXTURES.empty());
  await click('.t-ticket-status-draft-link');
  assert.equal(currentURL(), `${BASE_URL}/${TD.idOne}`);
  assert.equal(page.statusInput, TD.statusSeven);
  assert.equal(page.statusInput, TD.statusSeven);
  const ticket = store.find('ticket', TD.idOne);
  assert.equal(ticket.get('dt_path')[0]['dtd']['id'], DTD.idOne);
  const dt_data = DTF.detail(DTD.idOne);
  const returned_ticket = TF.detail(TD.idOne, null);
  xhr(`${PREFIX}/dt/${DTD.idTwo}/ticket/?ticket=${TD.idOne}`, 'GET', null, {}, 200, {dtd: dt_data, ticket:returned_ticket});
  await click('.t-dt-continue');
  assert.equal(currentURL(), `/dt/${DTD.idTwo}/ticket/${TD.idOne}`);
});

/* jshint ignore:end */
