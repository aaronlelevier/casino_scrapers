import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const ROLE_URL = '/admin/roles';

var application;

module('Acceptance | role-list', {
  beforeEach() {
    application = startApp();
    var endpoint = PREFIX + ROLE_URL + '/';
    xhr( endpoint ,'GET',null,{},200,ROLE_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /role', function(assert) {
  visit(ROLE_URL);

  andThen(() => {
    assert.equal(currentURL(),ROLE_URL);
    assert.equal(find('h1.t-roles').text(), 'Roles');
    assert.equal(find('tr.t-role-data').length, 3);
  });
});

