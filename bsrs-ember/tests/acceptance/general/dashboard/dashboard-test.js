import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

var application, store, endpoint;

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.dashboard_url;

module('Acceptance | dashboard', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('amk welcome h1 header and dashboard_text from settings', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
    assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
    assert.equal(find('.t-nav-list-home').length, 1);
    assert.equal(find('.t-nav-list-draft').length, 1);
    assert.equal(find('.t-nav-list-new').length, 1);
    assert.equal(find('.t-nav-list-in_progress').length, 1);
  });
});
