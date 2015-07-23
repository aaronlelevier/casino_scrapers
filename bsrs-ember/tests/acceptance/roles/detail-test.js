import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const ROLE_URL = "/admin/roles";
const DETAIL_URL = "/admin/roles/3";
const SUBMIT_BTN = ".submit_btn";
const SAVE_BTN = '.t-save-btn';
var application, store;

module('Acceptance | role-detail', {
  beforeEach() {
    application = startApp();
    store = application.__container__.lookup('store:main');
    var endpoint = PREFIX + ROLE_URL + "/";
    xhr( endpoint ,"GET",null,{},200,ROLE_FIXTURES.list() );
    xhr( endpoint + "3/","GET",null,{},200,ROLE_FIXTURES.detail() );
  },
  afterEach() {
    Ember.run(application, 'destroy');
  }
});

test('clicking a role name will redirect to the given detail view', (assert) => {
  visit(ROLE_URL);

  andThen(() => {
    assert.equal(currentURL(),ROLE_URL);
  });

  click('.t-person-data:eq(0)');

  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });
});

test('when you deep link to the role detail view you get bound attrs', (assert) => {
  visit(DETAIL_URL);

  andThen(() => {
    //TODO: verify ALL the other dynamic bits
    assert.equal(currentURL(),DETAIL_URL);
    assert.equal(find('.t-role-name').val(), 'System Administrator');
  });

  var url = PREFIX + DETAIL_URL + "/";
  var response = ROLE_FIXTURES.detail();
  var payload = ROLE_FIXTURES.put({name: 'Broom Pusher'});
  xhr( url,'PUT',payload,{},200,response );
  fillIn('.t-role-name', 'Broom Pusher');
  click(SAVE_BTN);
  andThen(() => {
    assert.equal(currentURL(),ROLE_URL);
  });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
  visit(ROLE_URL);

  andThen(() => {
    assert.equal(currentURL(),ROLE_URL);
  });

  click('.t-person-data:eq(0)');

  andThen(() => {
    assert.equal(currentURL(),DETAIL_URL);
  });

  click('.t-cancel-btn');

  andThen(() => {
    assert.equal(currentURL(), ROLE_URL);
  });
});
