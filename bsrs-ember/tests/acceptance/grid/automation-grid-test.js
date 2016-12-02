import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import AD from 'bsrs-ember/vendor/defaults/automation';
import AF from 'bsrs-ember/vendor/automation_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/automation';
import generalPage from 'bsrs-ember/tests/pages/general';
import { isDisabledElement, isNotDisabledElement } from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import BASEURLS, { AUTOMATION_URL, AUTOMATION_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const API_DETAIL_URL = `${AUTOMATION_URL}${AD.idOne}/`;

const NUMBER_FOUR = {keyCode: 52};

let application, store, listXhr;

moduleForAcceptance('Acceptance | automation grid test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${AUTOMATION_URL}?page=1`, 'GET', null, {}, 200, listData);
  }
});

/* jshint ignore:start */

test('template translation tags as variables', async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(generalPage.gridTitle, t('admin.automation.other'));
  assert.equal(Ember.$('.t-grid-search-input').get(0)['placeholder'], t('admin.automation.search'));
  assert.equal(generalPage.gridPageCountText, '19 ' + t('admin.automation.other'));
  // column headers
  assert.equal(page.descriptionSortText, t('admin.automation.description'));
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(page.descriptionGridOne, AD.descriptionOne+'1');
  // assert.equal(page.assigneeGridOne, AD.fullname);
  pagination(assert);
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', async (assert) => {
  var page_two = `${AUTOMATION_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,AF.list());
  await visit(AUTOMATION_LIST_URL);
  await click('.t-page:eq(1) a');
  const automations = store.find('automation-list');
  assert.equal(automations.get('length'), 10);
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-automation-description').text().trim()), AD.descriptionOne);
  var paginationz = find('.t-pages');
  assert.equal(paginationz.find('.t-page').length, 2);
  assert.equal(paginationz.find('.t-page:eq(0) a').text().trim(), '1');
  assert.equal(paginationz.find('.t-page:eq(1) a').text().trim(), '2');
  assert.ok(!paginationz.find('.t-page:eq(0) a').hasClass('active'));
  assert.ok(paginationz.find('.t-page:eq(1) a').hasClass('active'));
  await click('.t-page:eq(0) a');
  assert.equal(automations.get('length'), 10);
  assert.equal(currentURL(),AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
  pagination(assert);
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', async (assert) => {
  var page_two = `${AUTOMATION_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,AF.list_two());
  await visit(AUTOMATION_LIST_URL);
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
  isDisabledElement('.t-first');
  isDisabledElement('.t-previous');
  isNotDisabledElement('.t-next');
  isNotDisabledElement('.t-last');
  await click('.t-next a');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'11');
  isNotDisabledElement('.t-first');
  isNotDisabledElement('.t-previous');
  isDisabledElement('.t-next');
  isDisabledElement('.t-last');
  await click('.t-previous a');
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
  isDisabledElement('.t-first');
  isDisabledElement('.t-previous');
  isNotDisabledElement('.t-next');
  isNotDisabledElement('.t-last');
  await click('.t-last a');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?page=2');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'11');
  isNotDisabledElement('.t-first');
  isNotDisabledElement('.t-previous');
  isDisabledElement('.t-next');
  isDisabledElement('.t-last');
  await click('.t-first a');
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
  isDisabledElement('.t-first');
  isDisabledElement('.t-previous');
  isNotDisabledElement('.t-next');
  isNotDisabledElement('.t-last');
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  random.uuid = function() { return UUID.value; };
  var sort_one = `${AUTOMATION_URL}?page=1&ordering=description`;
  xhr(sort_one ,'GET',null,{},200,AF.sorted_page_one('description'));
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
  await click('.t-sort-description-dir');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?sort=description');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'1');
});

// description search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionGridOne);
  const searchText = '4';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, AF.searched(searchText, 'description', 1));
  await fillIn('.t-grid-search-input', searchText);
  await triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  assert.equal(currentURL(),AUTOMATION_LIST_URL + `?search=${searchText}`);
  assert.equal(find('.t-grid-data').length, 2);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionOne+'14');
  assert.equal(find('.t-grid-data:eq(1) .t-automation-description').text().trim(), AD.descriptionOne+'4');
  await click('.t-reset-grid');
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionGridOne);
});

test('multiple sort options appear in the query string as expected', async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(currentURL(), AUTOMATION_LIST_URL);
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionGridOne);
  var sort_one = `${AUTOMATION_URL}?page=1&ordering=description`;
  xhr(sort_one ,'GET',null,{},200, AF.sorted_page_one('description'));
  await click('.t-sort-description-dir');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?sort=description');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionGridOne);
  var sort = `${AUTOMATION_URL}?page=1&ordering=-description`;
  xhr(sort ,'GET',null,{},200, AF.list_reverse());
  await click('.t-sort-description-dir');
  assert.equal(currentURL(), AUTOMATION_LIST_URL + '?sort=-description');
  assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  assert.equal(find('.t-grid-data:eq(0) .t-automation-description').text().trim(), AD.descriptionGridOneReverse);
});

test('export csv button shows in grid header', async (assert) => {
  await visit(AUTOMATION_LIST_URL);
  assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
  assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  xhr(`${EXPORT_DATA_URL}automation/`, 'GET', null, {}, 200, undefined);
  await click('[data-test-id="grid-export-btn"]');
});


test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=description';
  xhr(sort_one ,"GET",null,{},200,AF.sorted('description'));
  visitSync(AUTOMATION_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),AUTOMATION_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  andThen(() => {
    Ember.$('.t-sort-description-dir').click();
    assert.equal(find('.t-grid-loading-graphic').length, 1);
  });
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});
/* jshint ignore:end */
