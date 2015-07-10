import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PeopleFactory from 'bsrs-ember/tests/helpers/people';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import config from 'bsrs-ember/config/environment';

const PEOPLE_URL = "/admin/people";
const API_PREFIX = "/" + config.APP.NAMESPACE;

var application;

module('Acceptance | people-list', {
  beforeEach: function() {
    application = startApp();
    var endpoint = API_PREFIX + PEOPLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list() );
  },
  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /people', function(assert) {
  visit(PEOPLE_URL);

  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
    assert.equal(find('h1.t-people').text(), 'People');
  });
});
