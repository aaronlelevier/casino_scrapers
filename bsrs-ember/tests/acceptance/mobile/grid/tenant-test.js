import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CF from 'bsrs-ember/vendor/currency_fixtures';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import TENANT_DEFAULTS from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/tenant-mobile';
import tenantPage from 'bsrs-ember/tests/pages/tenant';
import generalMobilePage from 'bsrs-ember/tests/pages/general-mobile';
import generalPage from 'bsrs-ember/tests/pages/general';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL, CURRENCIES_URL } from 'bsrs-ember/utilities/urls';

var store, list_xhr;

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DASHBOARD_URL = BASEURLS.DASHBOARD_URL;
const DETAIL_URL = `${BASE_URL}/index/${TD.idOne}`;
const Currency = '.t-tenant-currency-select';

moduleForAcceptance('Acceptance | grid tenant mobile test', {
  beforeEach() {
    setWidth('mobile');
    store = this.application.__container__.lookup('service:simpleStore');
    list_xhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, TF.list());
  },
});

/* jshint ignore:start */

test('only renders grid items from server and not other tenant objects already in store', async assert => {
  /* MOBILE doesn't clear out grid items on every route call to allow for infinite scrolling. If other tenant in store, this will fail */
  xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET', null, {}, 200, {settings: {dashboard_text: TENANT_DEFAULTS.dashboard_text}});
  await visit(DASHBOARD_URL);
  assert.equal(currentURL(), DASHBOARD_URL);
  assert.equal(store.find('tenant-list').get('length'), 0);
  clearxhr(list_xhr);
  xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, TF.list_two());
  await visit(TENANT_LIST_URL);
  assert.equal(currentURL(), TENANT_LIST_URL);
  assert.equal(store.find('tenant-list').get('length'), 9);
});

test('visiting mobile tenant grid show correct layout', async assert => {
  await tenantPage.visit();
  const tenant = store.findOne('tenant-list');
  assert.equal(currentURL(), TENANT_LIST_URL);
  assert.equal(find('.t-mobile-grid-title').text().trim(), '19 Tenant');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').text().trim());
  // Based on tenant-list
  assert.ok(find('.t-grid-data:eq(0) > div:eq(0)').hasClass('t-tenant-company_name'));
});

test('tenant company_name filter will filter down results and reset page to 1', async assert => {
  xhr(`${TENANT_URL}?page=1&company_name__icontains=${TD.companyNameLastPage2Grid}`, 'GET', null, {}, 200, TF.searched(TD.companyNameLastPage2Grid, 'company_name'));
  clearxhr(list_xhr);
  xhr(`${TENANT_URL}?page=2`, 'GET', null, {}, 200, TF.list());
  await visit(TENANT_LIST_URL+'?page=2');
  assert.equal(currentURL(), TENANT_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.company_nameOneGrid);
  await generalMobilePage.clickFilterOpen();
  await page.clickFiltercompanyName();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(TD.companyNameLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.company_nameLastPage2Grid);
});

test('filtering on priority will sort when filter is clicked', async assert => {
  // This is just an example
  xhr(`${TENANT_URL}?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await tenantPage.visit();
  assert.equal(store.find('tenant-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(find('.t-checkbox-list').length, 1);
  assert.equal(page.priorityOneIsChecked(), false);
  await page.priorityOneCheck();
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await generalMobilePage.submitFilterSort();
  assert.equal(store.find('tenant-list').get('length'), 10);
  assert.equal(find('.t-grid-data:eq(0) > .t-tenant-priority-translated_name span').text().trim(), t('tenant.priority.emergency'));
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  assert.equal(page.priorityOneIsChecked(), true);
  assert.equal(page.priorityTwoIsChecked(), false);
  assert.equal(page.priorityThreeIsChecked(), false);
  assert.equal(page.priorityFourIsChecked(), false);
  await page.priorityTwoCheck();
  xhr(`${TENANT_URL}?page=1&priority__id__in=${TD.priorityOneId},${TD.priorityTwoId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityTwoId, 'priority'));
  await generalMobilePage.submitFilterSort();
});

// test('can uncheck a value after already checked and no xhr is sent', async assert => {
//   xhr(`${TENANT_URL}?page=1&priority__id__in=${TD.priorityOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
//   await tenantPage.visit();
//   assert.equal(store.find('tenant-list').get('length'), 10);
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   await page.clickFilterPriority();
//   assert.equal(find('.t-filter__input-wrap').length, 1);
//   assert.equal(find('.t-checkbox-list').length, 1);
//   assert.equal(page.priorityOneIsChecked(), false);
//   await page.priorityOneCheck();
//   assert.equal(page.priorityOneIsChecked(), true);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
//   await generalMobilePage.submitFilterSort();
//   assert.equal(store.find('tenant-list').get('length'), 10);
//   assert.equal(find('.t-grid-data:eq(0) > .t-tenant-priority-translated_name span').text().trim(), t('tenant.priority.emergency'));
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 1);
//   await page.priorityOneCheck();
//   assert.equal(page.priorityOneIsChecked(), false);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
//   await generalMobilePage.submitFilterSort();
//   await generalMobilePage.clickFilterOpen();
//   assert.equal(find('.t-filter__input-wrap').length, 0);
//   assert.equal(page.priorityOneIsChecked(), false);
//   assert.equal(page.priorityTwoIsChecked(), false);
//   assert.equal(page.priorityThreeIsChecked(), false);
//   assert.equal(page.priorityFourIsChecked(), false);
// });

test('filtering on multiple parameters', async assert => {
  // This is just an example
  xhr(`${TENANT_URL}?page=1&priority__id__in=${TD.priorityOneId}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await tenantPage.visit();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  await page.clickFilterPriority();
  await page.priorityOneCheck();
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
});

test('filtering currency on power select and can remove', async assert => {
  // Replace priority with secondProperty
  // Assuming secondModel is person
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idBoy}`, 'GET', null, {}, 200, TF.searched_related(TD.currencySelectOne, 'currency'));
  await tenantPage.visit();
  assert.equal(store.find('tenant-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(Currency).length, 0);
  await page.clickFilterAssignee();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${CURRENCIES_URL}currency__icontains=boy/`, 'GET', null, {}, 200, CF.search_power_select());
  await selectSearch(Currency, 'boy');
  await selectChoose(Currency, CurrencyD.nameBoy);
  assert.equal(page.currencyInput.split(' ')[1], CurrencyD.nameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.currencyInput.split(' ')[1], CurrencyD.nameBoy);
  removeMultipleOption(Currency, CurrencyD.nameBoy);
  await generalMobilePage.submitFilterSort();
});

test('filtering currency on power select and can remove', async assert => {
  // this is just an example.  Need multiple (assignee, status to use this test)
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idFour},${CurrencyD.idThree}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idFour}&status__id__in=${TD.statusOneId}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idFour}`, 'GET', null, {}, 200, TF.searched_related(TD.priorityOneId, 'priority'));
  await tenantPage.visit();
  assert.equal(store.find('tenant-list').get('length'), 10);
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-filter__input-wrap').length, 0);
  assert.equal(find(Currency).length, 0);
  await page.clickFilterCurrency();
  assert.equal(find('.t-filter__input-wrap').length, 1);
  xhr(`${CURRENCIES_URL}currency__icontains=6/`, 'GET', null, {}, 200, CF.search_power_select());
  await selectSearch(Currency, '6');
  await selectChoose(Currency, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.currencyInput.split(' ')[1], 'ZXY863');
  await page.clickFilterStatus();
  await page.statusOneCheck();
  await generalMobilePage.submitFilterSort();
  // Select another currency
  await generalMobilePage.clickFilterOpen();
  xhr(`${CURRENCIES_URL}currency__icontains=9/`, 'GET', null, {}, 200, CF.search_power_select());
  await selectSearch(Currency, '9');
  await selectChoose(Currency, 'GHI789');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.currencyInput.split(' ')[1], 'ZXY863');
  assert.equal(page.currencyInput.split(' ')[3], 'GHI789');
  // Remove
  await removeMultipleOption(Currency, 'ZXY863');
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(page.currencyInput.split(' ')[1], 'GHI789');
});

test('removing find or id_in filter will reset grid', async assert => {
  // Replace idBoy with what you are searching on the secondModel
  xhr(`${TENANT_URL}?page=1&currency__id__in=${CurrencyD.idBoy}`, 'GET', null, {}, 200, {'results': []});
  await tenantPage.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterAssignee();
  xhr(`${CURRENCIES_URL}currency__icontains=boy/`, 'GET', null, {}, 200, CF.search_power_select());
  await selectSearch(Currency, 'boy');
  await selectChoose(Currency, CurrencyD.nameBoy);
  await generalMobilePage.submitFilterSort();
  await generalMobilePage.clickFilterOpen();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), '');
  removeMultipleOption(Currency, CurrencyD.nameBoy);
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.company_nameOneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.company_nameOneGrid);
  await generalMobilePage.clickFilterOpen();
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.company_nameOneGrid);
});

/* jshint ignore:end */
