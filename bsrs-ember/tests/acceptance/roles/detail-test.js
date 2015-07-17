import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import RoleFactory from 'bsrs-ember/tests/helpers/roles';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const LIST_URL = "/admin/roles";
const DETAIL_URL = "/admin/roles/3";
const SUBMIT_BTN = ".submit_btn";

var application;

module('Acceptance | role-detail', {
  beforeEach() {
    application = startApp();
    var endpoint = PREFIX + LIST_URL + "/";
    xhr( endpoint ,"GET",null,{},200,RoleFactory.list() );
    xhr( endpoint + "3/","GET",null,{},200,RoleFactory.detail() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('clicking a role name will redirect to the given detail view', function(assert) {
  visit(LIST_URL);

  andThen(() => {
    assert.equal(currentURL(),LIST_URL);
  });

  click('.t-data:eq(0)');

  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });
});

test('when you deep link to the role detail view you get bound attrs', function(assert) {
  visit(DETAIL_URL);

  andThen(() => {
    //TODO: verify ALL the other dynamic bits
    assert.equal(currentURL(),DETAIL_URL);
    assert.equal(find('.t-role-name').val(), 'System Administrator');
  });

  var url = PREFIX + DETAIL_URL + "/";
  var response = RoleFactory.detail();
  var payload = RoleFactory.put('Broom Pusher');
  xhr( url,'PUT',payload,{},200,response );
  fillIn('.t-role-name', 'Broom Pusher');
  click('.t-save-btn');
  andThen(() => {
    assert.equal(currentURL(),LIST_URL);
  });
});

test('clicking cancel button will take from detail view to list view', function(assert) {
  visit(LIST_URL);

  andThen(() => {
    assert.equal(currentURL(),LIST_URL);
  });

  click('.t-data:eq(0)');

  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });

  click('.t-cancel-btn');

  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});
