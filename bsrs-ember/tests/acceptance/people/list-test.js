import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PeopleFactory from 'bsrs-ember/tests/helpers/people';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";

var application;

module('Acceptance | people-list', {
  beforeEach() {
    application = startApp();
    var endpoint = PREFIX + PEOPLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('visiting /people', function(assert) {
  visit(PEOPLE_URL);

  andThen(() => {
    assert.equal(currentURL(),PEOPLE_URL);
    assert.equal(find('h1.t-people').text(), 'People');
    assert.equal(find('tr.t-data').length, 5);
  });
});
