import Ember from 'ember';
import module from 'bsrs-ember/tests/helpers/module';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';

var application, store, dashboard_xhr;

const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.dashboard_url;

module('Acceptance | amk mobile dashboard test', {
  beforeEach() {
    /* SETUP */
    application = startApp();
    store = application.__container__.lookup('service:simpleStore');
    dashboard_xhr = xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
    /* MOBILE RENDER */
    const flexi = application.__container__.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const bp = {};
    breakpoints.forEach((point) => {
      bp[point.name] = point.begin + 5;
    });
    flexi.set('width', bp.mobile);
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('dashboard renders with welcome text and no sidebar', assert => {
  visit(DASHBOARD_URL);
  andThen(() => {
    assert.equal(find('.t-dashboard-text').text().trim(), 'Welcome');
    assert.equal(find('.t-dashboard-text h1').prop('tagName'), 'H1');
    assert.equal(find('.t-side-menu').length, 0);
  });
});
