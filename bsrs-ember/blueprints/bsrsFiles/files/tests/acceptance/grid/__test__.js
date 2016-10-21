import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import <%= FirstCharacterModuleName %>F from 'bsrs-ember/vendor/<%= dasherizedModuleName %>_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/<%= dasherizedModuleName %>';
import generalPage from 'bsrs-ember/tests/pages/general';
import { isDisabledElement, isNotDisabledElement } from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import BASEURLS, { <%= CapitalizeModule %>_URL, <%= CapitalizeModule %>_LIST_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const DETAIL_URL = `${BASE_URL}/${<%= FirstCharacterModuleName %>D.idOne}`;
const API_DETAIL_URL = `${<%= CapitalizeModule %>_URL}${<%= FirstCharacterModuleName %>D.idOne}/`;

const NUMBER_FOUR = {keyCode: 52};

let application, store, listXhr;

moduleForAcceptance('Acceptance | <%= dasherizedModuleName %>-grid-test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = <%= FirstCharacterModuleName %>F.list();
    listXhr = xhr(`${<%= CapitalizeModule %>_URL}?page=1`, 'GET', null, {}, 200, listData);
  }
});

test('template translation tags as variables', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(generalPage.gridTitle, t('<%= dasherizedModuleName %>.other'));
    assert.equal(Ember.$('.t-grid-search-input').get(0)['placeholder'], t('<%= dasherizedModuleName %>.search'));
    assert.equal(generalPage.gridPageCountText, '19 '+t('<%= dasherizedModuleName %>.other'));
    // column headers
    assert.equal(page.<%= firstPropertyCamel %>SortText, t('<%= dasherizedModuleName %>.label.<%= firstProperty %>'));
    assert.equal(page.<%= secondProperty %>SortText, t('<%= dasherizedModuleName %>.label.<%= secondProperty %>'));
  });
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(page.<%= firstPropertyCamel %>GridOne, <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
    assert.equal(page.<%= secondProperty %>GridOne, <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>+'0');
    pagination(assert);
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = `${<%= CapitalizeModule %>_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,<%= FirstCharacterModuleName %>F.list());
  visit(<%= CapitalizeModule %>_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const <%= dasherizedModuleName %>s = store.find('<%= dasherizedModuleName %>-list');
    assert.equal(<%= dasherizedModuleName %>s.get('length'), 10);
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim()), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim()), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>.slice(0,-1));
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const <%= dasherizedModuleName %>s = store.find('<%= dasherizedModuleName %>-list');
    assert.equal(<%= dasherizedModuleName %>s.get('length'), 10);
    assert.equal(currentURL(),<%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
    pagination(assert);
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = `${<%= CapitalizeModule %>_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,<%= FirstCharacterModuleName %>F.list_two());
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), `${<%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne.slice(0,-1)}11`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), `${<%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne.slice(0,-1)}11`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
  });
  random.uuid = function() { return UUID.value; };
  var sort_one = `${<%= CapitalizeModule %>_URL}?page=1&ordering=<%= firstProperty %>`;
  xhr(sort_one ,'GET',null,{},200,<%= FirstCharacterModuleName %>F.sorted_page_one('<%= firstProperty %>'));
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
  });
  click('.t-sort-<%= firstProperty %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=<%= firstProperty %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'1');
  });
});

// <%= firstProperty %> search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>GridOne);
  });
  const searchText = '4';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.searched(searchText, '<%= firstProperty %>', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),<%= CapitalizeModule %>_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'14');
    assert.equal(find('.t-grid-data:eq(1) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>One+'4');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>GridOne);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>GridOne);
  });
  var sort_one = `${<%= CapitalizeModule %>_URL}?page=1&ordering=<%= firstProperty %>`;
  xhr(sort_one ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.sorted_page_one('<%= firstProperty %>'));
  click('.t-sort-<%= firstProperty %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=<%= firstProperty %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>GridOne);
  });
  var sort = `${<%= CapitalizeModule %>_URL}?page=1&ordering=-<%= firstProperty %>`;
  xhr(sort ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.list_reverse());
  click('.t-sort-<%= firstProperty %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=-<%= firstProperty %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= firstProperty %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= firstPropertyCamel %>GridOneReverse);
  });
});

// <%= secondProperty %>.<%= secondModelDisplaySnake %> search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
  });
  const searchText = '10';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.searched(searchText, '<%= firstProperty %>', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),<%= CapitalizeModule %>_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridTen);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
  });
});

test('sort by <%= secondProperty %> <%= secondModelDisplaySnake %>', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
  });
  var sort_one = `${<%= CapitalizeModule %>_URL}?page=1&ordering=<%= secondProperty %>__<%= secondModelDisplaySnake %>`;
  xhr(sort_one ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.sorted_page_one('<%= secondProperty %>'));
  click('.t-sort-<%= secondProperty %>-<%= secondModelDisplaySnake %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=<%= secondProperty %>.<%= secondModelDisplaySnake %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridOne);
  });
  var sort = `${<%= CapitalizeModule %>_URL}?page=1&ordering=-<%= secondProperty %>__<%= secondModelDisplaySnake %>`;
  xhr(sort ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.list_reverse());
  click('.t-sort-<%= secondProperty %>-<%= secondModelDisplaySnake %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=-<%= secondProperty %>.<%= secondModelDisplaySnake %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= secondProperty %>-<%= secondModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= secondModelDisplaySnake %>GridTen);
  });
});

test('sort by <%= thirdProperty %> <%= thirdAssociatedModelDisplaySnake %>', function(assert) {
  visit(<%= CapitalizeModule %>_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= thirdProperty %>-<%= thirdAssociatedModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= thirdAssociatedModelDisplaySnake %>GridOne);
  });
  var sort_one = `${<%= CapitalizeModule %>_URL}?page=1&ordering=<%= thirdProperty %>__<%= thirdAssociatedModelDisplaySnake %>`;
  xhr(sort_one ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.sorted_page_one('<%= thirdProperty %>'));
  click('.t-sort-<%= thirdProperty %>-<%= thirdAssociatedModelDisplaySnake %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=<%= thirdProperty %>.<%= thirdAssociatedModelDisplaySnake %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= thirdProperty %>-<%= thirdAssociatedModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= thirdAssociatedModelDisplaySnake %>GridOne);
  });
  var sort = `${<%= CapitalizeModule %>_URL}?page=1&ordering=-<%= thirdProperty %>__<%= thirdAssociatedModelDisplaySnake %>`;
  xhr(sort ,'GET',null,{},200, <%= FirstCharacterModuleName %>F.list_reverse());
  click('.t-sort-<%= thirdProperty %>-<%= thirdAssociatedModelDisplay %>-dir');
  andThen(() => {
    assert.equal(currentURL(), <%= CapitalizeModule %>_LIST_URL + '?sort=<%= thirdProperty %>.<%= thirdAssociatedModelDisplaySnake %>');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-<%= dasherizedModuleName %>-<%= thirdProperty %>-<%= thirdAssociatedModelDisplaySnake %>').text().trim(), <%= FirstCharacterModuleName %>D.<%= thirdAssociatedModelDisplaySnake %>GridTen);
  });
});
