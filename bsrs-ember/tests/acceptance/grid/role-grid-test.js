import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import RF from 'bsrs-ember/vendor/role_fixtures';
import RD from 'bsrs-ember/vendor/defaults/role';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { ROLE_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_roles_url;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};
const SORT_NAME_DIR = '.t-sort-name-dir';
const SAVE_FILTERSET_MODAL = '.t-show-save-filterset-modal';

var application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | role-grid-list', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint ,'GET',null,{},200,RF.list());
  },
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, function(assert) {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Roles');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
    assert.equal(find('.t-grid-data:eq(0) .t-role-role_type').text().trim(), t(RD.t_roleTypeGeneral));
    assert.equal(find('.t-grid-data:eq(0) .t-role-location_level').text().trim(), RD.locationLevelNameOne);
    pagination(assert);
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,RF.list_two());
  visit(ROLE_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const people = store.find('role-list');
    assert.equal(people.get('length'), 9);
    assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-role-name').text().trim()), 'xav');
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const people = store.find('role-list');
    assert.equal(people.get('length'), 10);
    assert.equal(currentURL(),ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
    pagination(assert);
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,RF.list_two());
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  random.uuid = function() { return UUID.value; };
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
  xhr(sort_two ,"GET",null,{},200,RF.sorted_page_one('role_type,name'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
  xhr(page_two ,"GET",null,{},200,RF.sorted_page_two('name'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,RF.sorted_page_one('name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL + '?page=2&sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-role-role_type').text().trim(), t(RD.t_roleTypeContractor));
  });
  click('.t-sort-role-type-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=role_type%2Cname');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  var search_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=14';
  xhr(search_two ,"GET",null,{},200,RF.searched('14', 'name'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=role_type';
  xhr(page_two ,"GET",null,{},200,RF.searched('', 'name', 2));
  var page_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type';
  xhr(page_one ,"GET",null,{},200,RF.searched('', 'name'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=4';
  xhr(sort_one ,"GET",null,{},200,RF.sorted('role_type'));
  var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(search_one ,"GET",null,{},200,RF.searched('4', 'name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=4');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-role-name').text().trim()), 'xav');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-role-name').text().trim()), 'zap');
  });
  click('.t-sort-role-type-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=4&sort=role_type');
    // assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-role-name').text().trim()), 'xav');
    // assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-role-name').text().trim()), 'zap');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=&sort=role_type');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?page=2&search=&sort=role_type');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
  });
  fillIn('.t-grid-search-input', '14');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=14&sort=role_type');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-role-name').text().trim()), 'xav');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
  xhr(sort_two ,"GET",null,{},200,RF.sorted_page_one('role_type,name'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,RF.sorted_page_one('name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);

  });
  click('.t-sort-role-type-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=role_type%2Cname');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  random.uuid = function() { return UUID.value; };
  var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=role_type';
  xhr(sort_four ,"GET",null,{},200,RF.sorted('name,role_type'));
  var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,role_type';
  xhr(sort_three ,"GET",null,{},200,RF.sorted('-name,role_type'));
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
  xhr(sort_two ,"GET",null,{},200,RF.sorted('role_type,name'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,RF.sorted('name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
    assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
    assert.equal(find('.t-reset-grid').length, 0);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), 'xav11');
  });
  click('.t-sort-role-type-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=role_type%2Cname');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), 'xav11');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=-name%2Crole_type');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), 'xav11');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?sort=role_type');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
    assert.ok(!find('.t-sort-name-dir').hasClass('fa-sort-asc'));
    // assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), 'zap9'); //firefox and chrome can't agree
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i&name__icontains=xav';
  xhr(find_two ,"GET",null,{},200,RF.sorted('role_type:i,name:xav'));
  let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i';
  xhr(find_one ,"GET",null,{},200,RF.fulltext('role_type:i', 1));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
  filterGrid('role_type', 'i');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?find=role_type%3Ai');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), 'xav11');
  });
  filterGrid('name', 'xav');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?find=role_type%3Ai%2Cname%3Axav');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-role-name').text().trim()), 'xav');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-role-name').text().trim(), RD.nameOne);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,RF.sorted('name'));
  visitSync(ROLE_LIST_URL);
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-data').length, 6);
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  click('.t-sort-name-dir');
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
  visit(ROLE_LIST_URL);
  click('.t-filter-name');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
  click('.t-filter-role-type');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  let find_three = PREFIX + BASE_URL + '/?page=1&name__icontains=7';
  xhr(find_three ,"GET",null,{},200,RF.sorted('name:7'));
  let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in&name__icontains=7';
  xhr(find_two ,"GET",null,{},200,RF.sorted('role_type:in,name:7'));
  let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in';
  xhr(find_one ,"GET",null,{},200,RF.fulltext('role_type:in', 1));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.ok(!find('.t-filter-name').hasClass('on'));
    assert.ok(!find('.t-filter-role-type').hasClass('on'));
  });
  filterGrid('role_type', 'in');
  andThen(() => {
    assert.ok(!find('.t-filter-name').hasClass('on'));
    assert.ok(find('.t-filter-role-type').hasClass('on'));
  });
  filterGrid('name', '7');
  andThen(() => {
    assert.ok(find('.t-filter-name').hasClass('on'));
    assert.ok(find('.t-filter-role-type').hasClass('on'));
  });
  filterGrid('role_type', '');
  andThen(() => {
    assert.ok(find('.t-filter-name').hasClass('on'));
    assert.ok(!find('.t-filter-role-type').hasClass('on'));
  });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4&name__icontains=4';
  xhr(option_three ,'GET',null,{},200,RF.sorted('name:4'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4';
  xhr(option_two ,'GET',null,{},200,RF.sorted('name:4'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one ,'GET',null,{},200,RF.searched('4', 'id'));
  visit(ROLE_LIST_URL);
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=4');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=4&sort=name');
  });
  filterGrid('name', '4');
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?find=name%3A4&search=4&sort=name');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
  });
  click('.t-filter-name');
  andThen(() => {
    let name_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(name_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one ,'GET',null,{},200,RF.searched('4', 'name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Roles`);
  });
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=4');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-page-count').text(), '2 Roles');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + '?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Roles`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,RF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,RF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,RF.list_two());
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), ROLE_LIST_URL);
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
    assert.equal(currentURL(), ROLE_LIST_URL + '?page=2');
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
    assert.equal(currentURL(),ROLE_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + `?page_size=${PAGE_SIZE}`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    //TODO: figure out why not 2
    // assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    // assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
  clearxhr(list_xhr);
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,RF.paginated(updated_pg_size));
  visit(ROLE_LIST_URL + `?page_size=${updated_pg_size}`);
  andThen(() => {
    assert.equal(currentURL(),ROLE_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,'GET',null,{},200,RF.sorted('name'));
  visit(ROLE_LIST_URL);
  click('.t-sort-name-dir');
  click(SAVE_FILTERSET_MODAL);
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
//   var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//   xhr(sort_one ,'GET',null,{},200,RF.sorted('name'));
//   let name = 'foobar';
//   let routePath = 'admin.roles.index';
//   let url = window.location.toString();
//   let query = '?sort=name';
//   let section = '.t-grid-wrap';
//   let navigation = '.t-filterset-wrap li';
//   let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//   visit(ROLE_LIST_URL);
//   click('.t-sort-name-dir');
//   click(SAVE_FILTERSET_MODAL);
//   xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//   saveFilterSet(name, routePath);
//   andThen(() => {
//     let html = find(section);
//     assert.equal(html.find(navigation).length, 2);
//     let filterset = store.find('filterset', UUID.value);
//     assert.equal(filterset.get('name'), name);
//     assert.equal(filterset.get('endpoint_name'), routePath);
//     assert.equal(filterset.get('endpoint_uri'), query);
//   });
// });

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
  let name = 'foobar';
  let routePath = 'admin.roles.index';
  let query = '?foo=bar';
  let navigation = '.t-filterset-wrap div';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(ROLE_LIST_URL);
  clearAll(store, 'filterset');
  andThen(() => {
    store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
  });
  andThen(() => {
    let section = find('.t-grid-wrap');
    assert.equal(section.find(navigation).length, 1);
  });
  xhr('/api/admin/saved-searches/' + UUID.value + '/', 'DELETE', null, {}, 204, {});
  click(navigation + '> a > .t-remove-filterset:eq(0)');
  andThen(() => {
    let section = find('.t-grid-wrap');
    assert.equal(section.find(navigation).length, 0);
  });
});

test('save filterset button only available when a dynamic filter is present', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,'GET',null,{},200,RF.sorted('name'));
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
  });
});

////this test is specifically for filterset it just happens to use this module and the role fixture data
//test('save filterset button is not available when page size or page is altered and only sort/find/search are persisted', function(assert) {
//  const updated_pg_size = PAGE_SIZE*2;
//  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
//  visit(ROLE_LIST_URL);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=2`, 'GET',null,{},200,RF.list_two());
//  click('.t-page:eq(1) a');
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&page_size=${updated_pg_size}`, 'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  alterPageSize('.t-page-size', updated_pg_size);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&page_size=${updated_pg_size}` ,'GET',null,{},200,RF.paginated(updated_pg_size));
//  click(SORT_NAME_DIR);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  click('.t-reset-grid');
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&page_size=${updated_pg_size}&name__icontains=xav` ,'GET',null,{},200,RF.list());
//  filterGrid('name', 'xav');
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&page_size=${updated_pg_size}&name__icontains=xav`, 'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  click(SORT_NAME_DIR);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&page_size=${PAGE_SIZE}&name__icontains=xav`, 'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  alterPageSize('.t-page-size', PAGE_SIZE);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=2&ordering=name&page_size=${PAGE_SIZE}&name__icontains=xav`, 'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  click('.t-page:eq(1) a');
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  let query = '?find=name%3Axav&sort=name';
//  let payload = {id: 'abc123', name: 'example', endpoint_name: 'admin.roles.index', endpoint_uri: query};
//  patchRandomAsync(0);
//  click(SAVE_FILTERSET_MODAL);
//  ajax('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//  saveFilterSet('example', 'admin.roles.index');
//  andThen(() => {
//    const filterset = store.find('filterset', 'abc123');
//    assert.equal(filterset.get('endpoint_uri'), query);
//  });
//});

//this test is specifically for applying saved filtersets ... it just happens to use this module and the role fixture data
test('applying a saved filterset will reset the page to 1 by default', function(assert) {
  const filter_name = 'foobar';
  const updated_pg_size = PAGE_SIZE*2;
  Ember.run(function() {
    store.push('filterset', {id: 'def456', name: filter_name, endpoint_name: 'admin.roles.index', endpoint_uri: '?find=name%3Axav&sort=name'});
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(find('.t-filterset-wrap div:eq(0) a').text().trim(), filter_name);
  });
  ajax(`${PREFIX}${BASE_URL}/?page=2`, 'GET',null,{},200,RF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&name__icontains=xav` ,'GET',null,{},200,RF.paginated(updated_pg_size));
  click('.t-filterset-wrap div:eq(0) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?find=name%3Axav&sort=name');
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

//this test is specifically for applying saved filtersets ... it just happens to use this module and the role fixture data
test('each time you apply a saved filterset the query params are reset to reflect only the currently active filterset', function(assert) {
  const filter_one = 'foobar';
  const filter_two = 'adminOnly';
  Ember.run(function() {
    store.push('filterset', {id: 'def456', name: filter_one, endpoint_name: 'admin.roles.index', endpoint_uri: '?find=name%3Axav&search=zap'});
    store.push('filterset', {id: 'ghi789', name: filter_two, endpoint_name: 'admin.roles.index', endpoint_uri: '?search=admin&sort=name'});
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(find('.t-filterset-wrap div:eq(0) a').text().trim(), filter_one);
    assert.equal(find('.t-filterset-wrap div:eq(1) a').text().trim(), filter_two);
    assert.ok(!find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&search=zap&name__icontains=xav` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
  click('.t-filterset-wrap div:eq(0) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?find=name%3Axav&search=zap');
    assert.ok(find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&search=admin` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
  click('.t-filterset-wrap div:eq(1) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?search=admin&sort=name');
    assert.ok(!find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
  });
});

////this test is specifically for applying saved filtersets ... it just happens to use this module and the role fixture data
//test('after saving a filterset the save button button is not visible', function(assert) {
//  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
//  visit(ROLE_LIST_URL);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  click(SORT_NAME_DIR);
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 1);
//  });
//  let query = '?sort=name';
//  let payload = {id: 'abc123', name: 'example', endpoint_name: 'admin.roles.index', endpoint_uri: query};
//  patchRandomAsync(0);
//  click(SAVE_FILTERSET_MODAL);
//  ajax('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//  saveFilterSet('example', 'admin.roles.index');
//  andThen(() => {
//    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
//  });
//});

//this test is specifically for applying saved filtersets ... it just happens to use this module and the role fixture data
test('when a filterset that has a search is applied both the querystring and the search input', function(assert) {
  const filter_one = 'foobar';
  const filter_two = 'adminOnly';
  const filter_three = 'noSearch';
  Ember.run(function() {
    store.push('filterset', {id: 'def456', name: filter_one, endpoint_name: 'admin.roles.index', endpoint_uri: '?find=name%3Axav&search=zap'});
    store.push('filterset', {id: 'ghi789', name: filter_two, endpoint_name: 'admin.roles.index', endpoint_uri: '?search=admin&sort=name'});
    store.push('filterset', {id: 'jkl234', name: filter_three, endpoint_name: 'admin.roles.index', endpoint_uri: '?sort=name'});
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(find('.t-filterset-wrap div:eq(0) a').text().trim(), filter_one);
    assert.equal(find('.t-filterset-wrap div:eq(1) a').text().trim(), filter_two);
    assert.equal(find('.t-filterset-wrap div:eq(2) a').text().trim(), filter_three);
    assert.equal(find('.t-grid-search-input').val(), '');
    assert.ok(!find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(2) a').hasClass('active'));
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&search=zap&name__icontains=xav` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
  click('.t-filterset-wrap div:eq(0) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?find=name%3Axav&search=zap');
    assert.equal(find('.t-grid-search-input').val(), 'zap');
    assert.ok(find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(2) a').hasClass('active'));
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&search=admin` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
  click('.t-filterset-wrap div:eq(1) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?search=admin&sort=name');
    assert.equal(find('.t-grid-search-input').val(), 'admin');
    assert.ok(!find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(2) a').hasClass('active'));
  });
  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
  click('.t-filterset-wrap div:eq(2) a');
  andThen(() => {
    assert.equal(find(SAVE_FILTERSET_MODAL).length, 0);
    assert.equal(currentURL(), '/admin/roles/index?sort=name');
    assert.equal(find('.t-grid-search-input').val(), '');
    assert.ok(!find('.t-filterset-wrap div:eq(0) a').hasClass('active'));
    assert.ok(!find('.t-filterset-wrap div:eq(1) a').hasClass('active'));
    assert.ok(find('.t-filterset-wrap div:eq(2) a').hasClass('active'));
  });
});

test('export csv button shows in grid header', (assert) => {
  visit(ROLE_LIST_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}role/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});

////this test is specifically for applying saved filtersets ... it just happens to use this module and the role fixture data
//test('adding a new filterset with search will still allow the search input to be updated when another is applied', function(assert) {
//  const filter_one = 'foobar';
//  Ember.run(function() {
//    store.push('filterset', {id: 'def456', name: filter_one, endpoint_name: 'admin.roles.index', endpoint_uri: '?sort=name'});
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1`, 'GET', null, {}, 200, RF.list());
//  visit(ROLE_LIST_URL);
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  click(SORT_NAME_DIR);
//  andThen(() => {
//    assert.equal(currentURL(), '/admin/roles/index?sort=name');
//    assert.equal(find('.t-filterset-wrap li:eq(0) a').text().trim(), filter_one);
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name&search=4` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  fillIn('.t-grid-search-input', '4');
//  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//  andThen(() => {
//    assert.equal(currentURL(), '/admin/roles/index?search=4&sort=name');
//    assert.equal(find('.t-grid-search-input').val(), '4');
//  });
//  let query = '?search=4&sort=name';
//  let payload = {id: 'abc123', name: 'example', endpoint_name: 'admin.roles.index', endpoint_uri: query};
//  patchRandomAsync(0);
//  click(SAVE_FILTERSET_MODAL);
//  ajax('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//  saveFilterSet('example', 'admin.roles.index');
//  andThen(() => {
//    assert.equal(currentURL(), '/admin/roles/index?search=4&sort=name');
//    assert.equal(find('.t-grid-search-input').val(), '4');
//  });
//  ajax(`${PREFIX}${BASE_URL}/?page=1&ordering=name` ,'GET',null,{},200,RF.paginated(PAGE_SIZE));
//  click('.t-filterset-wrap li:eq(0) a');
//  andThen(() => {
//    assert.equal(currentURL(), '/admin/roles/index?sort=name');
//    assert.equal(find('.t-grid-search-input').val(), '');
//  });
//});
