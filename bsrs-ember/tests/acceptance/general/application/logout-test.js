import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import windowProxy from 'bsrs-ember/utilities/window-proxy';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import config from 'bsrs-ember/config/environment';

const HOME_URL = '/';
const PREFIX = config.APP.NAMESPACE;

var application;

module('Acceptance | logout test', {
  beforeEach() {
    application = startApp();
    xhr(`${PREFIX}/tickets/?status__name=ticket.status.draft`,'GET', null, {}, 200, TF.list(TD.statusSevenId, TD.statusSevenKey));
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('logout of application correctly directs to login page', (assert) => {
  visit(HOME_URL);
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
