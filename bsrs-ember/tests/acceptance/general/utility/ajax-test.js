import Ember from 'ember';
import { test } from 'qunit';
import config from 'bsrs-ember/config/environment';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import BASEURLS from 'bsrs-ember/utilities/urls';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr'; //kill this soon plz
import TD from 'bsrs-ember/vendor/defaults/ticket';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_people_url;
const LIST_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + PEOPLE_DEFAULTS.id;
const XHR_LIST_URL = PREFIX + BASE_URL;
const XHR_DETAIL_URL = XHR_LIST_URL + '/' + PEOPLE_DEFAULTS.id + '/';
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;

var application;

moduleForAcceptance('Acceptance | ajax async test helper tests', {
  beforeEach() {
    xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  },
});


test('ajax should reset any xhr previously set with the same url and verb between ember.runs', (assert) => {
  xhr(XHR_LIST_URL + '/?page=1', 'GET', null, {}, 200, PEOPLE_FIXTURES.list());
  visit('/');
  andThen(() => {
    assert.equal(currentURL(), '/dashboard');
  });
  ajax(XHR_DETAIL_URL, 'GET', null, {}, 200, PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id));
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-person-username').val(), PEOPLE_DEFAULTS.username);
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  visit('/');
  andThen(() => {
    assert.equal(currentURL(), '/dashboard');
  });
  ajax(XHR_DETAIL_URL, 'GET', null, {}, 200, PEOPLE_FIXTURES.detail(PEOPLE_DEFAULTS.id, 'wat'));
  visit(DETAIL_URL);
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-person-username').val(), 'wat');
  });
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
});
