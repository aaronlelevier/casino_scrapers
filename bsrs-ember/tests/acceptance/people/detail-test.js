import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PeopleFactory from 'bsrs-ember/tests/helpers/people';
import config from 'bsrs-ember/config/environment'; 

const PEOPLE_URL = "/admin/people";
const DETAIL_URL = "/admin/people/11";
const SUBMIT_BTN = ".submit_btn";
const API_PREFIX = "/" + config.APP.NAMESPACE;

var application;

module('Acceptance | people-detail', {
  beforeEach: function() {
    application = startApp();
    var endpoint = API_PREFIX + PEOPLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,PeopleFactory.list() );
    xhr( endpoint + "11/","GET",null,{},200,PeopleFactory.detail() );
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
    assert.equal(find('.t-person-title').val(), 'RVP');
    assert.equal(find('.t-person-first-name').val(), 'Lynne');
    assert.equal(find('.t-person-last-name').val(), 'Cooley');
    assert.equal(find('.t-person-username').val(), 'lcooley');
  });

  var url = API_PREFIX + DETAIL_URL + "/";
  var response = PeopleFactory.detail();
  var payload = PeopleFactory.put('mastermind');
  xhr( url,'PUT',payload,{},200,response );
  fillIn('.t-person-title', 'mastermind');
  click('.t-save-btn');
  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
  });
});
