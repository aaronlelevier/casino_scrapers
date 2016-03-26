import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';

let application;

module('Acceptance | role-list', {
  beforeEach() {
    application = startApp();
    let endpoint = PREFIX + BASE_URL + '/';
    xhr(endpoint + '?page=1' ,'GET',null,{},200,ROLE_FIXTURES.list());
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /role', function(assert) {
  visit(ROLE_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
    assert.equal(find('.t-sort-name').text(), t('admin.role.label.name'));
    assert.equal(find('.t-sort-role-type').text(), t('admin.role.label.role_type'));
    // assert.equal(find('.t-sort-location-level').text(), t('admin.role.label.name'));
  });
});
