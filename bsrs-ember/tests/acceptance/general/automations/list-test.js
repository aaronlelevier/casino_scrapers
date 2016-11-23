import Ember from 'ember';
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL } from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const API_DETAIL_URL = `${AUTOMATION_URL}${AD.idOne}/`;

let store;

moduleForAcceptance('Acceptance | general automation list test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
  },
});

skip('can click automations from the Dashboard to grid and then to detail', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.clickAutomations();
  andThen(() => {
    assert.equal(currentURL(), AUTOMATION_LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, AF.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
