import Ember from 'ember';
import { test } from 'qunit';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import BASEURLS from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

const PREFIX = config.APP.NAMESPACE;
const HOME_URL = '/';
const NAVBAR = '.t-navbar-items';
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

var application;

moduleForAcceptance('Acceptance | application layout test', {
  beforeEach(assert) {
    
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach(assert) {
    
  }
});

test('navigating to unkown route will redirect to dashboard', (assert) => {
  visit('/wat');
  andThen(() => {
    assert.equal(currentURL(), DASHBOARD_URL);
  });
});
