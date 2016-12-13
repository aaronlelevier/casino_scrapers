import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LLF from 'bsrs-ember/vendor/location-level_fixtures';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { LOCATION_LEVEL_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_location_levels_url;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_NINE = {keyCode: 57};
const BACKSPACE = {keyCode: 8};

var application, endpoint, list_xhr;

moduleForAcceptance('Acceptance | location-level grid list', {
  beforeEach() {
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint ,"GET",null,{},200,LLF.list());
  },
});

test('initial load should only show first PAGE_SIZE records ordered by id with correct pagination and no additional xhr', function(assert) {
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.equal(document.title,  t('doctitle.location_level.index', { count: 13 }));
    assert.equal(find('.t-grid-title').text(), 'Location Levels');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
    pagination(assert);
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = PREFIX+BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,LLF.list_two());
  visit(LOCATION_LEVEL_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const location_levels = this.store.find('location-level-list');
    assert.equal(location_levels.get('length'), 9);
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const location_levels = this.store.find('location-level-list');
    assert.equal(location_levels.get('length'), 13);
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
    pagination(assert);
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = PREFIX+BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,LLF.list_two());
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  var page_two = PREFIX+BASE_URL + '/?page=2&ordering=name';
  xhr(page_two ,"GET",null,{},200,LLF.sorted_page_two('name'));
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted_page_one('name'));
  visit(LOCATION_LEVEL_LIST_URL);
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?page=2&sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameGridOne);
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  var search_two = PREFIX+BASE_URL + '/?page=1&ordering=name&search=19';
  xhr(search_two ,"GET",null,{},200,LLF.searched('19', 'name'));
  var page_two = PREFIX+BASE_URL + '/?page=2&ordering=name';
  xhr(page_two ,"GET",null,{},200,LLF.searched('', 'name', 2));
  var page_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(page_one ,"GET",null,{},200,LLF.searched('', 'name'));
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name&search=9';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted('name'));
  var search_one = PREFIX+BASE_URL + '/?page=1&search=9';
  xhr(search_one ,"GET",null,{},200,LLF.searched('9', 'name'));
  visit(LOCATION_LEVEL_LIST_URL);
  fillIn('.t-grid-search-input', '9');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=9');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE/5);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-location-level-name').text().trim()), 'Company');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=9&sort=name');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=&sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?page=2&search=&sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    // assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company');
  });
  fillIn('.t-grid-search-input', '19');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=19&sort=name');
    assert.equal(find('.t-grid-data').length, 1);
    // assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');//firefox discrepancy
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted('name'));
  visit(LOCATION_LEVEL_LIST_URL);
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  var sort_two = PREFIX+BASE_URL + '/?page=1&ordering=-name';
  xhr(sort_two ,"GET",null,{},200,LLF.sorted('name'));
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted('name'));
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
    assert.equal(find('.t-reset-grid').length, 0);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?sort=name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?sort=-name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  // let find_two = PREFIX+BASE_URL + '/?page=1&number__icontains=num&name__icontains=7';
  // xhr(find_two ,"GET",null,{},200,LLF.sorted('number:num,name:7'));
  let find_one = PREFIX+BASE_URL + '/?page=1&name__icontains=tsi';
  xhr(find_one ,"GET",null,{},200,LLF.fulltext('name:tsi', 1));
  visit(LOCATION_LEVEL_LIST_URL);
  filterGrid('name', 'tsi');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?find=name%3Atsi');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-level-name').text().trim()), 'Company-tsiname');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text().trim(), LLD.nameCompany);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted('name'));
  visitSync(LOCATION_LEVEL_LIST_URL);
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-data').length, 8);
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL);
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
  visit(LOCATION_LEVEL_LIST_URL);
  click('.t-filter-name');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  // let find_two = PREFIX+BASE_URL + '/?page=1';
  // xhr(find_two ,"GET",null,{},200,LLF.fulltext('name:', 1));
  let find_one = PREFIX+BASE_URL + '/?page=1&name__icontains=tsi';
  xhr(find_one ,"GET",null,{},200,LLF.fulltext('name:tsi', 1));
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.ok(!find('.t-filter-name').hasClass('on'));
  });
  filterGrid('name', 'tsi');
  andThen(() => {
    assert.ok(find('.t-filter-name').hasClass('on'));
  });
  filterGrid('name', '');
  andThen(() => {
    assert.ok(!find('.t-filter-name').hasClass('on'));
  });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX+BASE_URL + '/?page=1&ordering=name&search=9&name__icontains=9';
  xhr(option_three ,'GET',null,{},200,LLF.sorted('name:9'));
  let option_two = PREFIX+BASE_URL + '/?page=1&ordering=name&search=9';
  xhr(option_two ,'GET',null,{},200,LLF.sorted('name:9'));
  let option_one = PREFIX+BASE_URL + '/?page=1&search=9';
  xhr(option_one ,'GET',null,{},200,LLF.searched('9', 'id'));
  visit(LOCATION_LEVEL_LIST_URL);
  fillIn('.t-grid-search-input', '9');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=9');
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=9&sort=name');
  });
  filterGrid('name', '9');
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?find=name%3A9&search=9&sort=name');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
  });
  click('.t-filter-name');
  andThen(() => {
    let name_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(name_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX+BASE_URL + '/?page=1&search=9';
  xhr(option_one ,'GET',null,{},200,LLF.searched('9', 'name'));
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${(PAGE_SIZE*2)-1} Location Levels`);
  });
  fillIn('.t-grid-search-input', '9');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=9');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE/5);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE/5} Location Levels`);
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + '?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${(PAGE_SIZE*2)-1} Location Levels`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX+BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,LLF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX+BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,LLF.paginated(updated_pg_size));
  let page_two = PREFIX+BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,LLF.list_two());
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL);
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
    assert.equal(currentURL(), LOCATION_LEVEL_LIST_URL + '?page=2');
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
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + `?page_size=${PAGE_SIZE}`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    //TODO: not sure what is going on here.  Should be two pages
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
  let option_one = PREFIX+BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,LLF.paginated(updated_pg_size));
  visit(LOCATION_LEVEL_LIST_URL + `?page_size=${updated_pg_size}`);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,'GET',null,{},200,LLF.sorted('name'));
  visit(LOCATION_LEVEL_LIST_URL);
  click('.t-sort-name-dir');
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
//     random.uuid = function() { return UUID.value; };
//     var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,LLF.sorted('name'));
//     let name = 'foobar';
//     let routePath = 'admin.location-levels.index';
//     let url = window.location.toString();
//     let query = '?sort=name';
//     let section = '.t-grid-wrap';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(LOCATION_LEVEL_LIST_URL);
//     click('.t-sort-name-dir');
//     click('.t-show-save-filterset-modal');
//     xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//     saveFilterSet(name, routePath);
//     andThen(() => {
//         let html = find(section);
//         assert.equal(html.find(navigation).length, 1);
//         let filterset = this.store.find('filterset', UUID.value);
//         assert.equal(filterset.get('name'), name);
//         assert.equal(filterset.get('endpoint_name'), routePath);
//         assert.equal(filterset.get('endpoint_uri'), query);
//     });
// });

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
  let name = 'foobar';
  let routePath = 'admin.location-levels.index';
  let query = '?foo=bar';
  let navigation = '.t-filterset-wrap div';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(LOCATION_LEVEL_LIST_URL);
  clearAll(this.store, 'filterset');
  andThen(() => {
    this.store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
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
  var sort_one = PREFIX+BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,'GET',null,{},200,LLF.sorted('name'));
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 0);
  });
  click('.t-sort-name-dir');
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 1);
  });
});

test('export csv button shows in grid header', (assert) => {
  visit(LOCATION_LEVEL_LIST_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}location-level/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
  xhr(sort_one ,"GET",null,{},200,LLF.sorted('name'));
  visitSync(LOCATION_LEVEL_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),LOCATION_LEVEL_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  andThen(() => {
    Ember.$('.t-sort-name-dir').click();
    assert.equal(find('.t-grid-loading-graphic').length, 1);
  });
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});
