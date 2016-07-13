import Ember from 'ember';
import { test } from 'qunit';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

const PREFIX = config.APP.NAMESPACE;
const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

var application;

module('Acceptance | application layout test', {
  beforeEach(assert) {
    application = startApp();
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach(assert) {
    Ember.run(application, 'destroy');
  }
});

test('navigating to unkown route will redirect to dashboard', (assert) => {
  visit('/wat');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
});
