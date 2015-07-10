import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment'; 
import PEOPLE_FIXTURES from 'bsrs-ember/tests/helpers/people';
const PEOPLE_URL = "/admin/people";
const DETAIL_URL = "/admin/people/11";
const SUBMIT_BTN = ".submit_btn";
const API_PREFIX = "/" + config.APP.NAMESPACE;

var application;

module('Acceptance | people-detail', {
  beforeEach: function() {
    application = startApp();
    var endpoint = API_PREFIX + PEOPLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list() );
    xhr( endpoint + "11/","GET",null,{},200,PEOPLE_FIXTURES.detail(1) );
  },
  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('clicking a persons name will redirect to the given detail view', function(assert) {
  visit(PEOPLE_URL);

  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
  });

  click('.t-data:eq(0)');

  andThen(function() {
    assert.equal(currentURL(),DETAIL_URL);
  });
});

test('when you deep link to the person detail view you get bound attrs', function(assert) {
  visit(DETAIL_URL);

  andThen(function() {
    //TODO: verify ALL the other dynamic bits
    assert.equal(currentURL(),DETAIL_URL);
    assert.equal(find('.t-person-username').val(), 'lcooley');
    assert.equal(find('.t-person-first-name').val(), 'Lynne');
    assert.equal(find('.t-person-last-name').val(), 'Cooley');
    assert.equal(find('.t-person-title').val(), 'RVP');
    assert.equal(find('.t-person-emp_number').val(), '5063');
    assert.equal(find('.t-input-multi').find('input').length, 2);
    assert.equal(find('.t-input-multi').find('input:eq(0)').val(), '858-715-5026');
    assert.equal(find('.t-input-multi').find('input:eq(1)').val(), '858-715-5056');
    assert.equal(find('.t-person-auth_amount').val(), '50000.0000');
  });

  var url = API_PREFIX + DETAIL_URL + "/";
  var response = PEOPLE_FIXTURES.detail(1);
  var payload = PEOPLE_FIXTURES.put('llcoolj', 'Ice', 'Cube', 'mastermind', '1122', '0.000');
  xhr( url,'PUT',payload,{},200,response );
  fillIn('.t-person-username', 'llcoolj');
  fillIn('.t-person-first-name', 'Ice');
  fillIn('.t-person-last-name', 'Cube');
  fillIn('.t-person-title', 'mastermind');
  fillIn('.t-person-emp_number', '1122');
  fillIn('.t-person-auth_amount', '0.000');
  click('.t-save-btn');
  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
  });
});

test('clicking cancel button will take from detail view to list view', function(assert) {
  visit(PEOPLE_URL);

  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
  });

  click('.t-data:eq(0)');

  andThen(function() {
    assert.equal(currentURL(),DETAIL_URL);
  });

  click('.t-cancel');

  andThen(function() {
    assert.equal(currentURL(), PEOPLE_URL);
  });
});
