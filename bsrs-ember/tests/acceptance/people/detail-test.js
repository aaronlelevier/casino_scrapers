import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import config from 'bsrs-ember/config/environment';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import StateFactory from 'bsrs-ember/tests/helpers/states';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';

const PEOPLE_URL = "/admin/people";
const DETAIL_URL = "/admin/people/1";
const SUBMIT_BTN = ".submit_btn";
const API_PREFIX = "/" + config.APP.NAMESPACE;

var application;

module('Acceptance | people-detail', {
  beforeEach: function() {
    application = startApp();
    var endpoint = API_PREFIX + PEOPLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list() );
    xhr( endpoint + "1/","GET",null,{},200,PEOPLE_FIXTURES.detail(1) );

    // Need to convert to the new new
    xhr( API_PREFIX + "/states/","GET",null,{},200,StateFactory.list() );

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
    assert.equal(find('.t-person-username').val(), 'akrier');
    assert.equal(find('.t-person-first-name').val(), 'Andy');
    assert.equal(find('.t-person-last-name').val(), 'Krier');
    assert.equal(find('.t-person-title').val(), 'RVP');
    assert.equal(find('.t-person-emp_number').val(), '5063');
    assert.equal(find('.t-input-multi-phone').find('input').length, 2);
    assert.equal(find('.t-input-multi-phone').find('input:eq(0)').val(), '858-715-5026');
    assert.equal(find('.t-input-multi-phone').find('input:eq(1)').val(), '858-715-5056');
    assert.equal(find('.t-person-auth_amount').val(), '50000.0000');
  });

  var url = API_PREFIX + DETAIL_URL + "/";
  var response = PEOPLE_FIXTURES.detail(1);
  var phone_numbers = [{id: 3, number: '858-715-5026', type: 1}, {id: 4, number: '858-715-5056', type: 2}];
  var payload = PEOPLE_FIXTURES.put(1, 'llcoolj', 'Ice', 'Cube', 'mastermind', '1122', '0.000', phone_numbers);
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

test('when you change a related phone numbers type it will be persisted correctly', function(assert) {
  visit(DETAIL_URL);
  var url = API_PREFIX + DETAIL_URL + "/";
  var phone_numbers = [{id: 3, number: '858-715-5026', type: 2}, {id: 4, number: '858-715-5056', type: 2}];
  var payload = PEOPLE_FIXTURES.put(1, null, null, null, null, null, null, phone_numbers);
  xhr(url,'PUT',payload,{},200);
  fillIn('.t-multi-phone-type:eq(0)', 2);
  click('.t-save-btn');
  andThen(function() {
    assert.equal(currentURL(),PEOPLE_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', function(assert) {
  visit(DETAIL_URL);
  fillIn('.t-person-username', 'llcoolj');
  click('.t-cancel-btn');
  andThen(function() {
      waitFor(function() {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-modal').is(':visible'), true);
        assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes');
      });
  });
  click('.t-modal-footer .t-modal-cancel-btn');
  andThen(function() {
      waitFor(function() {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-person-username').val(), 'llcoolj');
        assert.equal(find('.t-modal').is(':hidden'), true);
      });
  });
});

test('toran when user changes an attribute and clicks cancel we prompt them with a modal and they roll back', function(assert) {
  // var done = assert.async();
  visit(DETAIL_URL);
  fillIn('.t-person-username', 'llcoolj');
  click('.t-cancel-btn');
  andThen(function() {
      waitFor(function() {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-modal').is(':visible'), true);
        assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
      });
  });
  click('.t-modal-footer .t-modal-rollback-btn');
  andThen(function() {
      waitFor(function() {
        assert.equal(currentURL(), PEOPLE_URL);
        // assert.equal(find('.t-person-username').val(), 'llcoolj');
        // assert.equal(find('.t-modal').is(':hidden'), true);
      });
  });
});
