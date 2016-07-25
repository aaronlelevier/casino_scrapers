import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import <%= camelizedModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= camelizedModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import BASEURLS, { <%= CapitalizeModule %>_URL } from 'bsrs-ember/utilities/urls';
import generalPage from 'bsrs-ember/tests/pages/general';

const { run } = Ember;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const LIST_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${<%= camelizedModuleName %>D.idZero}`;
const API_DETAIL_URL = `${<%= CapitalizeModule %>_URL}${<%= camelizedModuleName %>D.idZero}/`;

let store;

moduleForAcceptance('Acceptance | <%= dasherizedModuleName %> list test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= camelizedModuleName %>F.list();
    xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
  },
});

test('can click <%= dasherizedModuleName %>s from the Dashboard to grid  and then to detail', assert => {
  visit(BASEURLS.base_admin_url);
  andThen(() => {
    assert.equal(currentURL(), BASEURLS.base_admin_url);
  });
  generalPage.click<%= CapFirstLetterModuleName %>s();
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
  });
  xhr(API_DETAIL_URL, 'GET', null, {}, 200, <%= camelizedModuleName %>F.detail());
  generalPage.gridItemZeroClick();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
  });
});
