import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';

var application, store, endpoint;
const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = `${BASE_URL}/index`;

module('Acceptance | dashboard', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('welcome h1 header', function(assert) {
  visit('/dashboard');
  andThen(() => {
    assert.equal(find('.t-admin-h1').text(), 'Welcome');
  });
});

/* jshint ignore:start */

test('draft tickets are shown', async assert => {
  xhr(`${PREFIX}${BASE_URL}/?status__name=ticket.status.draft/`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
  await visit('/dashboard');
  assert.equal(find('.t-ticket-draft').length, 10);
  const tickets = store.find('ticket-list')
  assert.equal(tickets.get('length'), 10);

});

/* jshint ignore:end */
