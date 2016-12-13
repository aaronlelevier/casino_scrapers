import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';
import { isDisabledElement, isNotDisabledElement } from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const API_DETAIL_URL = `${TENANT_URL}${TD.idOne}/`;

const NUMBER_FOUR = {keyCode: 52};

let application, listXhr;

moduleForAcceptance('Acceptance | tenant grid test', {
  beforeEach() {
    const listData = TF.list();
    listXhr = xhr(`${TENANT_URL}?page=1`, 'GET', null, {}, 200, listData);
  }
});

test('template translation tags as variables', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(generalPage.gridTitle, t('tenant.other'));
    assert.equal(Ember.$('.t-grid-search-input').get(0)['placeholder'], t('tenant.search'));
    assert.equal(generalPage.gridPageCountText, '19 '+t('tenant.other'));
    // column headers
    assert.equal(page.companyNameSortText, t('tenant.label.company_name'));
    assert.equal(page.companyCodeSortText, t('tenant.label.company_code'));
    assert.equal(page.testModeSortText, t('tenant.label.test_mode'));
  });
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(document.title,  t('doctitle.tenant.index', { count: 10 }));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(page.companyNameGridOne, TD.companyNameOne+'0');
    assert.equal(page.companyCodeGridOne, TD.companyCodeOne+'0');
    assert.equal(page.testModeGridOne, TD.test_mode);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = `${TENANT_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,TF.list());
  visit(TENANT_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const tenants = this.store.find('tenant-list');
    assert.equal(tenants.get('length'), 10);
    assert.equal(currentURL(), TENANT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim()), TD.companyNameOne);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim()), TD.companyCodeOne);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-tenant-test_mode').text().trim()), TD.test_mode);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const tenants = this.store.find('tenant-list');
    assert.equal(tenants.get('length'), 10);
    assert.equal(currentURL(),TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = `${TENANT_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,TF.list_two());
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-test_mode').val(), TD.test_mode);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-test_mode').val(), TD.test_mode);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-test_mode').val(), TD.test_mode);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-test_mode').val(), TD.test_mode);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+'0');
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-test_mode').val(), TD.test_mode);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
  });
  random.uuid = function() { return UUID.value; };
  var sort_one = `${TENANT_URL}?page=1&ordering=company_name`;
  xhr(sort_one ,'GET',null,{},200,TF.sorted_page_one('company_name'));
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
  });
  click('.t-sort-company-name-dir');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL + '?sort=company_name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'0');
  });
});

// company_name search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
  const searchText = '4';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, TF.searched(searchText, 'company_name', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TENANT_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+'14');
    assert.equal(find('.t-grid-data:eq(1) .t-tenant-company_name').text().trim(), TD.companyNameOne+'4');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
  var sort_one = `${TENANT_URL}?page=1&ordering=company_name`;
  xhr(sort_one ,'GET',null,{},200, TF.sorted_page_one('company_name'));
  click('.t-sort-company-name-dir');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL + '?sort=company_name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
  var sort = `${TENANT_URL}?page=1&ordering=-company_name`;
  xhr(sort ,'GET',null,{},200, TF.list_reverse());
  click('.t-sort-company-name-dir');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL + '?sort=-company_name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameGridOneReverse);
  });
});

// currency.name search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
  const searchText = '11';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, TF.searched(searchText, 'company_name', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TENANT_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"11");
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_name').text().trim(), TD.companyNameOne+"0");
  });
});

test('sort by company_code', function(assert) {
  visit(TENANT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+"0");
  });
  const searchText = '11';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, TF.searched(searchText, 'company_code', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TENANT_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+"11");
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-tenant-company_code').text().trim(), TD.companyCodeOne+"0");
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=company_name';
  xhr(sort_one ,"GET",null,{},200,TF.sorted('company_name'));
  visitSync(TENANT_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),TENANT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  andThen(() => {
    Ember.$('.t-sort-company-name-dir').click();
    assert.equal(find('.t-grid-loading-graphic').length, 1);
  });
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});
