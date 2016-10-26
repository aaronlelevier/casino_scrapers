import Ember from 'ember';
const { run } = Ember;
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import { test } from 'qunit';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import SD from 'bsrs-ember/vendor/defaults/status';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/person-mobile';
import personPage from 'bsrs-ember/tests/pages/person';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { PEOPLE_URL, PEOPLE_LIST_URL, LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_people_url;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${PD.idOne}`;

moduleForAcceptance('Acceptance | grid people mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other person objects already in store', async assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other people in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  await visit(DASHBOARD_URL);
  assert.equal(currentURL(), DASHBOARD_URL);
  assert.equal(store.find('person-list').get('length'), 0);
  clearxhr(list_xhr);
  xhr(`${PEOPLE_URL}?page=1`, 'GET', null, {}, 200, PF.list_two());
  await visit(PEOPLE_LIST_URL);
  assert.equal(currentURL(), PEOPLE_LIST_URL);
  assert.equal(store.find('person-list').get('length'), 8);
});

test('visiting mobile person grid show correct layout', async assert => {
  await personPage.visit();
  const person = store.findOne('person-list');
  assert.equal(currentURL(), PEOPLE_LIST_URL);
  assert.equal(find('.t-mobile-grid-title').text().trim(), '18 People');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-person-status-translated_name'));
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), PD.fullname);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(2)').text().trim(), PD.username);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(3)').text().trim(), PD.title);
  assert.equal(find('.t-grid-data:eq(0) > div:eq(4)').text().trim(), RD.nameOne);
});

test('person username filter will filter down results and reset page to 1', async assert => {
  xhr(`${PEOPLE_URL}?page=1&username__icontains=7`, 'GET', null, {}, 200, PF.searched('7', 'username'));
  clearxhr(list_xhr);
  xhr(`${PEOPLE_URL}?page=2`, 'GET', null, {}, 200, PF.list());
  await visit(PEOPLE_LIST_URL+'?page=2');
  assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterUsername();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('7');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(2)').text().trim(), PD.usernameLastPage2Grid);
});

test('person fullname filter will filter down results and reset page to 1', async assert => {
  xhr(`${PEOPLE_URL}?page=1&fullname__icontains=7`, 'GET', null, {}, 200, PF.searched('7', 'fullname'));
  clearxhr(list_xhr);
  xhr(`${PEOPLE_URL}?page=2`, 'GET', null, {}, 200, PF.list());
  await visit(PEOPLE_LIST_URL+'?page=2');
  assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterFullname();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('7');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), PD.fullnameLastPage2Grid);
});

test('person title filter will filter down results and reset page to 1', async assert => {
  xhr(`${PEOPLE_URL}?page=1&title__icontains=7`, 'GET', null, {}, 200, PF.searched('7', 'title'));
  clearxhr(list_xhr);
  xhr(`${PEOPLE_URL}?page=2`, 'GET', null, {}, 200, PF.list());
  await visit(PEOPLE_LIST_URL+'?page=2');
  assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterTitle();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput('7');
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), PD.titleLastPage2Grid);
});

test('filtering on status will sort when filter is clicked', async assert => {
  xhr(`${PEOPLE_URL}?page=1&status__id__in=${SD.activeId}`, 'GET', null, {}, 200, PF.searched_related(SD.activeId, 'status'));
  await personPage.visit();
  assert.equal(store.find('person-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterStatus();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.statusOneIsChecked(), false);
  await page.statusOneCheck();
  assert.equal(page.statusOneIsChecked(), true);
  assert.equal(page.statusTwoIsChecked(), false);
  assert.equal(page.statusThreeIsChecked(), false);
  assert.equal(page.statusFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('person-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-person-status-translated_name span').text().trim(), t('admin.person.status.active'));
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.statusOneIsChecked(), true);
  assert.equal(page.statusTwoIsChecked(), false);
  assert.equal(page.statusThreeIsChecked(), false);
  assert.equal(page.statusFourIsChecked(), false);
  await page.statusTwoCheck();
  xhr(`${PEOPLE_URL}?page=1&status__id__in=${SD.activeId},${SD.inactiveId}`, 'GET', null, {}, 200, PF.searched_related(PD.statusTwoId, 'status'));
  await generalMobilePage.submitFilterSort();
});

test('filtering on role will sort when filter is clicked', async assert => {
  xhr(`${PEOPLE_URL}?page=1&role__id__in=${RD.idOne}`, 'GET', null, {}, 200, PF.searched_related(RD.idOne, 'role'));
  await personPage.visit();
  assert.equal(store.find('person-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterRole();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.roleOneIsChecked(), false);
  await page.roleOneCheck();
  assert.equal(page.roleOneIsChecked(), true);
  assert.equal(page.roleTwoIsChecked(), false);
  assert.equal(page.roleThreeIsChecked(), false);
  assert.equal(page.roleFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('person-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-person-role-name').text().trim(), RD.nameOne);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.roleOneIsChecked(), true);
  assert.equal(page.roleTwoIsChecked(), false);
  assert.equal(page.roleThreeIsChecked(), false);
  assert.equal(page.roleFourIsChecked(), false);
  await page.roleTwoCheck();
  xhr(`${PEOPLE_URL}?page=1&role__id__in=${RD.idOne},${RD.idTwo}`, 'GET', null, {}, 200, PF.searched_related(RD.idOne, 'role'));
  await generalMobilePage.submitFilterSort();
});

/* jshint ignore:end */
