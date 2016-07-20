import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const HOME_URL = '/';
const PREFIX = config.APP.NAMESPACE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

var application;

moduleForAcceptance('Acceptance | logout test', {
  beforeEach() {
    
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TD.dashboard_text}});
  },
  afterEach() {
    
  }
});

test('logout of application correctly directs to login page', (assert) => {
  visit(HOME_URL);
  click('.dropdown-toggle');
  andThen(() => {
    assert.equal(find('.t-logout').text(), 'Logout');
    assert.equal(find('.t-person-profile-link').text(), 'Profile');
    assert.equal(find('.t-current-user-fullname').length, 1);
  });
  xhr( '/api-auth/logout/','GET',undefined,{},200,{} );
  click('.t-logout');
  andThen(() => {
    assert.equal(windowProxy.locationUrl, '/');
  });
});
