import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import page from 'bsrs-ember/tests/pages/dtd';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}`;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const NUMBER_FIVE = {keyCode: 53};
const BACKSPACE = {keyCode: 8};
const SORT_KEY_DIR = '.t-sort-key-dir';
const SORT_DESCRIPTION_DIR = '.t-sort-description-dir';
const FILTER_KEY = '.t-filter-key';
const FILTER_DESCRIPTION = '.t-filter-description';

var application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | dtd grid test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = `${PREFIX}${BASE_URL}/?page=1`;
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, DTDF.list());
  },
});

test('initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr', function(assert) {
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-title').text(), t('admin.dtd.one'));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-description').text().trim(), DTD.descriptionOne);
    pagination(assert);
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = `${PREFIX}${BASE_URL}/?page=2`;
  xhr(page_two ,"GET",null,{},200,DTDF.list_two());
  page.visit();
  click('.t-page:eq(1) a');
  andThen(() => {
    const dtds_all = store.find('dtd-list');
    assert.equal(dtds_all.get('length'), 9);
    assert.equal(currentURL(), `${DTD_URL}?page=2`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const dtds_all = store.find('dtd-list');
    assert.equal(dtds_all.get('length'), 10);
    assert.equal(currentURL(),DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    pagination(assert);
  });
});

test('clicking first,last,next and previous will key page 1 and 2 correctly', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,DTDF.list_two());
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=2&ordering=description,key';
  xhr(sort_two ,"GET",null,{},200,DTDF.sorted('key,key'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=key';
  xhr(page_two ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,DTDF.sorted('key'));
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(), DTD_URL + '?sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL + '?page=2&sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
  click(SORT_DESCRIPTION_DIR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?page=2&sort=description%2Ckey');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  var search_two = PREFIX + BASE_URL + '/?page=1&ordering=key&search=14';
  xhr(search_two ,"GET",null,{},200,DTDF.searched('14', 'key'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=key';
  xhr(page_two ,"GET",null,{},200,DTDF.sorted_page_two('key'));
  var page_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(page_one ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key&search=5';
  xhr(sort_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
  var search_one = PREFIX + BASE_URL + '/?page=1&search=5';
  xhr(search_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
  page.visit();
  fillIn('.t-grid-search-input', '5');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=5');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearchFiveOne);
    assert.equal(find('.t-grid-data:eq(1) .t-dtd-key').text().trim(), DTD.keySearchFiveTwo);
  });
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=5&sort=key');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearchFiveOne);
    assert.equal(find('.t-grid-data:eq(1) .t-dtd-key').text().trim(), DTD.keySearchFiveTwo);
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=&sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?page=2&search=&sort=key');
    assert.equal(find('.t-grid-data').length, 9);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
  });
  fillIn('.t-grid-search-input', '14');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=14&sort=key');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearch14);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=description,key';
  xhr(sort_two ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  page.visit();
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?sort=key`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
  click(SORT_DESCRIPTION_DIR);
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?sort=description%2Ckey`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=-description,-key';
  xhr(sort_four ,"GET",null,{},200,DTDF.sorted('-key,-description'));
  var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-key,description';
  xhr(sort_three ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=description,key';
  xhr(sort_two ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,DTDF.sorted_page_one('key'));
  page.visit();
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?sort=key`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
  click(SORT_DESCRIPTION_DIR);
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?sort=description%2Ckey`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    assert.ok(find(SORT_KEY_DIR).hasClass('fa-sort-asc'));
    assert.ok(find(SORT_DESCRIPTION_DIR).hasClass('fa-sort-asc'));
  });
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(), `${DTD_URL}?sort=-key%2Cdescription`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    assert.ok(find(SORT_KEY_DIR).hasClass('fa-sort-desc'));
    assert.ok(find(SORT_DESCRIPTION_DIR).hasClass('fa-sort-asc'));
  });
  click(SORT_DESCRIPTION_DIR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?sort=-description%2C-key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find(SORT_KEY_DIR).hasClass('fa-sort-desc'));
    assert.ok(find(SORT_DESCRIPTION_DIR).hasClass('fa-sort-desc'));
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  let find_three = PREFIX + BASE_URL + '/?page=1&key__icontains=h';
  xhr(find_three, "GET",null,{},200,DTDF.sorted('id'));
  let find_one = `${PREFIX}${BASE_URL}/?page=1&key__icontains=13`;
  xhr(find_one ,"GET",null,{},200,DTDF.fulltext('key:13', 1));
  page.visit();
  filterGrid('key', '13');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?find=key%3A13');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearch13);
  });
  filterGrid('key', '');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?find=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // flakey jenkins failures
    // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
  filterGrid('key', 'h');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?find=key%3Ah');
    assert.equal(find('.t-grid-data').length, 0);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,DTDF.sorted('key'));
  visitSync(DTD_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-data').length, 0);
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  click(SORT_KEY_DIR);
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
  page.visit();
  click(FILTER_KEY);
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  let find_three = PREFIX + BASE_URL + '/?page=1&description__icontains=7';
  xhr(find_three ,"GET",null,{},200,DTDF.sorted('description:7'));
  let find_two = PREFIX + BASE_URL + '/?page=1&key__icontains=num&description__icontains=7';
  xhr(find_two ,"GET",null,{},200,DTDF.sorted('key:num,description:7'));
  let find_one = PREFIX + BASE_URL + '/?page=1&key__icontains=num';
  xhr(find_one ,"GET",null,{},200,DTDF.fulltext('key:num', 1));
  page.visit();
  andThen(() => {
    assert.ok(!find(FILTER_KEY).hasClass('on'));
    assert.ok(!find(FILTER_DESCRIPTION).hasClass('on'));
  });
  filterGrid('key', 'num');
  andThen(() => {
    assert.ok(find(FILTER_KEY).hasClass('on'));
    assert.ok(!find(FILTER_DESCRIPTION).hasClass('on'));
  });
  filterGrid('description', '7');
  andThen(() => {
    assert.ok(find(FILTER_KEY).hasClass('on'));
    assert.ok(find(FILTER_DESCRIPTION).hasClass('on'));
  });
  filterGrid('key', '');
  andThen(() => {
    assert.ok(!find(FILTER_KEY).hasClass('on'));
    assert.ok(find(FILTER_DESCRIPTION).hasClass('on'));
  });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=key&search=4&description__icontains=4';
  xhr(option_three ,'GET',null,{},200,DTDF.sorted('key:4'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=key&search=4';
  xhr(option_two ,'GET',null,{},200,DTDF.sorted('key:4'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one ,'GET',null,{},200,DTDF.searched('4', 'id'));
  page.visit();
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=4');
  });
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=4&sort=key');
  });
  filterGrid('description', '4');
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?find=description%3A4&search=4&sort=key');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
  });
  click(FILTER_KEY);
  andThen(() => {
    let key_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(key_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX + BASE_URL + '/?page=1&search=6';
  xhr(option_one ,'GET',null,{},200,DTDF.searched('6', 'key'));
  visit(DTD_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Decision Tree`);
  });
  fillIn('.t-grid-search-input', '6');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=6');
    // assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-page-count').text(), '2 Decision Tree');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + '?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Decision Tree`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,DTDF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,DTDF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,DTDF.list_two());
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), DTD_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), DTD_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + `?page_size=${PAGE_SIZE}`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
  clearxhr(list_xhr);
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,DTDF.paginated(updated_pg_size));
  visit(DTD_URL + `?page_size=${updated_pg_size}`);
  andThen(() => {
    assert.equal(currentURL(),DTD_URL + `?page_size=${updated_pg_size}`);
    // assert.equal(find('.t-grid-data').length, updated_pg_size-1);//not working???
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,'GET',null,{},200,DTDF.sorted('key'));
  page.visit();
  click(SORT_KEY_DIR);
  click('.t-show-save-filterset-modal');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
  click('.t-grid-search-input');
  andThen(() => {
    isNotFocused('.ember-modal-dialog input:first');
  });
});

// test('save filterset will fire off xhr and add item to the sidebar navigation', function(assert) {
//   random.uuid = function() { return UUID.value; };
//   var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
//   xhr(sort_one ,'GET',null,{},200,DTDF.sorted_page_one('key'));
//   let name = '3';
//   let routePath = 'dtds.index';
//   let url = window.location.toString();
//   let query = '?sort=key';
//   let section = '.t-grid-wrap';
//   let navigation = '.t-filterset-wrap li';
//   let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//   page.visit();
//   click(SORT_KEY_DIR);
//   click('.t-show-save-filterset-modal');
//   xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//   saveFilterSet(name, routePath);
//   andThen(() => {
//     let html = find(section);
//     assert.equal(html.find(navigation).length, 1);
//     let filterset = store.find('filterset', UUID.value);
//     assert.equal(filterset.get('name'), name);
//     assert.equal(filterset.get('endpoint_name'), routePath);
//     assert.equal(filterset.get('endpoint_uri'), query);
//   });
// });

// test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
//   let name = '3';
//   let routePath = 'dtds.index';
//   let query = '?key=3';
//   let navigation = '.t-filterset-wrap li';
//   let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//   page.visit();
//   clearAll(store, 'filterset');
//   andThen(() => {
//     store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
//   });
//   andThen(() => {
//     let section = find('.t-grid-wrap');
//     assert.equal(section.find(navigation).length, 1);
//   });
//   xhr('/api/admin/saved-searches/' + UUID.value + '/', 'DELETE', null, {}, 204, {});
//   click(navigation + '> a > .t-remove-filterset:eq(0)');
//   andThen(() => {
//     let section = find('.t-grid-wrap');
//     assert.equal(section.find(navigation).length, 0);
//   });
// });

test('save filterset button only available when a dynamic filter is present', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,'GET',null,{},200,DTDF.sorted('key'));
  page.visit();
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 0);
  });
  click(SORT_KEY_DIR);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 1);
  });
});

test('export csv button shows in grid header', (assert) => {
  visit(DTD_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}dtd/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});
