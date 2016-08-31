import Ember from 'ember';
const { run } = Ember;
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import { xhr, clearxhr } from 'bsrs-ember/tests/helpers/xhr';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import config from 'bsrs-ember/config/environment';
import page from 'bsrs-ember/tests/pages/assignment';
import generalPage from 'bsrs-ember/tests/pages/general';
import { isDisabledElement, isNotDisabledElement } from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const API_DETAIL_URL = `${ASSIGNMENT_URL}${AD.idOne}/`;

const NUMBER_FOUR = {keyCode: 52};

let application, store, listXhr;

moduleForAcceptance('Acceptance | assignment-grid-test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    const listData = AF.list();
    listXhr = xhr(`${ASSIGNMENT_URL}?page=1`, 'GET', null, {}, 200, listData);
  }
});

test('template translation tags as variables', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(generalPage.gridTitle, t('admin.assignment.other'));
    assert.equal(Ember.$('.t-grid-search-input').get(0)['placeholder'], t('admin.assignment.search'));
    assert.equal(generalPage.gridPageCountText, '19 ' + t('admin.assignment.other'));
    // column headers
    assert.equal(page.descriptionSortText, t('admin.assignment.description'));
    assert.equal(page.assigneeSortText, t('admin.assignment.assignee'));
  });
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(page.descriptionGridOne, AD.descriptionOne+'1');
    assert.equal(page.assigneeGridOne, AD.fullname+'1');
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = `${ASSIGNMENT_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,AF.list());
  visit(ASSIGNMENT_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const assignments = store.find('assignment-list');
    assert.equal(assignments.get('length'), 10);
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-assignment-description').text().trim()), AD.descriptionOne);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const assignments = store.find('assignment-list');
    assert.equal(assignments.get('length'), 10);
    assert.equal(currentURL(),ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = `${ASSIGNMENT_URL}?page=2`;
  xhr(page_two ,'GET',null,{},200,AF.list_two());
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), `${AD.fullnameGridOne.slice(0,-1)}11`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'11');
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), `${AD.fullnameGridOne.slice(0,-1)}11`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
  });
  random.uuid = function() { return UUID.value; };
  var sort_one = `${ASSIGNMENT_URL}?page=1&ordering=description`;
  xhr(sort_one ,'GET',null,{},200,AF.sorted_page_one('description'));
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
  });
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?sort=description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'1');
  });
});

// description search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionGridOne);
  });
  const searchText = '4';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, AF.searched(searchText, 'description', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ASSIGNMENT_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionOne+'14');
    assert.equal(find('.t-grid-data:eq(1) .t-assignment-description').text().trim(), AD.descriptionOne+'4');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionGridOne);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionGridOne);
  });
  var sort_one = `${ASSIGNMENT_URL}?page=1&ordering=description`;
  xhr(sort_one ,'GET',null,{},200, AF.sorted_page_one('description'));
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?sort=description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionGridOne);
  });
  var sort = `${ASSIGNMENT_URL}?page=1&ordering=-description`;
  xhr(sort ,'GET',null,{},200, AF.list_reverse());
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?sort=-description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-description').text().trim(), AD.descriptionGridOneReverse);
  });
});

// assignee.fullname search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
  });
  const searchText = '10';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,'GET',null,{},200, AF.searched(searchText, 'description', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ASSIGNMENT_LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridTen);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
  });
});

test('sort by assignee fullname', function(assert) {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
  });
  var sort_one = `${ASSIGNMENT_URL}?page=1&ordering=assignee__fullname`;
  xhr(sort_one ,'GET',null,{},200, AF.sorted_page_one('assignee'));
  click('.t-sort-assignee-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?sort=assignee.fullname');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridOne);
  });
  var sort = `${ASSIGNMENT_URL}?page=1&ordering=-assignee__fullname`;
  xhr(sort ,'GET',null,{},200, AF.list_reverse());
  click('.t-sort-assignee-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(), ASSIGNMENT_LIST_URL + '?sort=-assignee.fullname');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-assignment-assignee-fullname').text().trim(), AD.fullnameGridTen);
  });
});

test('export csv button shows in grid header', (assert) => {
  visit(ASSIGNMENT_LIST_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}assignment/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});
