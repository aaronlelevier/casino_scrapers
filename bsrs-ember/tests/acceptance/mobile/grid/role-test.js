import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import SD from 'bsrs-ember/vendor/defaults/status';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/role-mobile';
import rolePage from 'bsrs-ember/tests/pages/role';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PREFIX, ROLES_URL, ROLE_LIST_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PAGE_SIZE = config.APP.PAGE_SIZE;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${ROLE_LIST_URL}/index/${RD.idOne}`;

moduleForAcceptance('Acceptance | general grid roles mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${ROLES_URL}?page=1`, 'GET', null, {}, 200, RF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other role objects already in store', async assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other roles in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  await visit(DASHBOARD_URL);
  assert.equal(currentURL(), DASHBOARD_URL);
  assert.equal(store.find('role-list').get('length'), 0);
  clearxhr(list_xhr);
  xhr(`${ROLES_URL}?page=1`, 'GET', null, {}, 200, RF.list_two());
  await visit(ROLE_LIST_URL);
  assert.equal(currentURL(), ROLE_LIST_URL);
  assert.equal(store.find('role-list').get('length'), 9);
});

test('visiting mobile role grid show correct layout', async assert => {
  await rolePage.visit();
  const role = store.findOne('role-list');
  assert.equal(currentURL(), ROLE_LIST_URL);
  assert.equal(find('.t-mobile-grid-title').text().trim(), '19 Roles');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), RD.nameOne);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), RD.roleTypeGeneral);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(2)').text().trim(), RD.locationLevelNameOne);
});

test('role name filter will filter down results and reset page to 1', async assert => {
  xhr(`${ROLES_URL}?page=1&name__icontains=9`, 'GET', null, {}, 200, RF.searched('9', 'name'));
  clearxhr(list_xhr);
  xhr(`${ROLES_URL}?page=2`, 'GET', null, {}, 200, RF.list());
  await visit(ROLE_LIST_URL+'?page=2');
  assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterName();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('9');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), RD.nameLastPage2Grid);
});

test('role type filter will filter down results and reset page to 1', async assert => {
  xhr(`${ROLES_URL}?page=1&role_type__icontains=1`, 'GET', null, {}, 200, RF.searched(RD.roleTypeGeneral, 'role_type'));
  clearxhr(list_xhr);
  xhr(`${ROLES_URL}?page=2`, 'GET', null, {}, 200, RF.list());
  await visit(ROLE_LIST_URL+'?page=2');
  assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterRoleType();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.roleTypeOneIsChecked(), false);
  await page.roleTypeOneCheck();
  assert.equal(page.roleTypeOneIsChecked(), true);
  assert.equal(page.roleTypeTwoIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  // flakey test
  // assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), RD.nameGridTen);
});

/* jshint ignore:end */
