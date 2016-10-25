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
  assert.equal(find('.t-mobile-grid-title').text().trim(), '19 tenant.other');
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
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), TD.companyNameOne+'0');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterCompanyName();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(TD.companyNameLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(0)').text().trim(), TD.companyNameLastPage2Grid);
});

test('tenant company_code filter will filter down results and reset page to 1', async assert => {
  xhr(`${TENANT_URL}?page=1&company_code__icontains=${TD.companyCodeLastPage2Grid}`, 'GET', null, {}, 200, TF.searched(TD.companyCodeLastPage2Grid, 'company_code'));
  clearxhr(list_xhr);
  xhr(`${TENANT_URL}?page=2`, 'GET', null, {}, 200, TF.list());
  await visit(TENANT_LIST_URL+'?page=2');
  assert.equal(currentURL(), TENANT_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.companyCodeOne+'0');
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterCompanyCode();
  assert.equal(find('.t-filter-input').length, 1);
  await generalMobilePage.filterInput(TD.companyCodeLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.companyCodeLastPage2Grid);
});

test('filtering on multiple parameters', async assert => {
  xhr(`${TENANT_URL}?page=1&company_name__icontains=${TD.companyNameLastPage2Grid}&company_code__icontains=${TD.companyCodeLastPage2Grid}`, 'GET', null, {}, 200, TF.searched(TD.companyNameLastPage2Grid, 'company_name'));
  await tenantPage.visit();
  await generalMobilePage.clickFilterOpen();
  await page.clickFilterCompanyName();
  await generalMobilePage.filterInput(TD.companyNameLastPage2Grid);
  await triggerEvent('.t-filter-input', 'keyup', {keyCode: 68});
  await page.clickFilterCompanyCode();
  await generalMobilePage.filterInput2(TD.companyCodeLastPage2Grid);
  await triggerEvent('.t-filter-input:eq(1)', 'keyup', {keyCode: 68});
  await generalMobilePage.submitFilterSort();
  assert.equal(find('.t-grid-data:eq(0) > div:eq(1)').text().trim(), TD.companyCodeLastPage2Grid);
});

/* jshint ignore:end */
