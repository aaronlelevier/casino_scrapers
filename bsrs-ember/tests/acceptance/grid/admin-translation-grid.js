import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ATF from 'bsrs-ember/vendor/admin_translation_fixtures';
import ATD from 'bsrs-ember/vendor/defaults/translation';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { I18N_LIST_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_admin_translations_url;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr, run = Ember.run;

moduleForAcceptance('Acceptance | general admin translation grid list', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint ,"GET",null,{},200,ATF.list());
  }
});

test('initial load should only show first PAGE_SIZE records ordered by id with correct pagination and no additional xhr', function(assert) {
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Translations');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').length, 1);
    pagination(assert);
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,ATF.list_two());
  visit(I18N_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim()), 'home.welcome');
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
    pagination(assert);
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,ATF.list_two());
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_two ,"GET",null,{},200,ATF.sorted_page_one('key'));
  sort_two = PREFIX + BASE_URL + '/?page=2&ordering=key';
  xhr(sort_two ,"GET",null,{},200,ATF.sorted_page_two('key'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?page=2&sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim()), 'home.welcome');
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  var search_two = PREFIX + BASE_URL + '/?page=1&ordering=key&search=14';
  xhr(search_two ,"GET",null,{},200,ATF.searched('14', 'key'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=key';
  xhr(page_two ,"GET",null,{},200,ATF.searched('', 'key', 2));
  var page_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(page_one ,"GET",null,{},200,ATF.searched('', 'key'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key&search=4';
  xhr(sort_one ,"GET",null,{},200,ATF.searched('4', 'key'));
  var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(search_one ,"GET",null,{},200,ATF.searched('4', 'id'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=4');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), "home.welcome14");
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=4&sort=key');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), "home.welcome14");
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=&sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid + '1');
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?page=2&search=&sort=key');
    // assert.equal(find('.t-grid-data').length, 22);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim()), 'home.welcome');
  });
  fillIn('.t-grid-search-input', '14');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=14&sort=key');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), 'home.welcome14');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,ATF.sorted('key'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid + '1');
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,ATF.sorted('key'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-key-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
    assert.equal(find('.t-reset-grid').length, 0);
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?sort=key');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-key-dir').hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid + '1');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-key-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  let find_one = PREFIX + BASE_URL + '/?page=1&key__icontains=7';
  xhr(find_one ,"GET",null,{},200,ATF.fulltext('key', 1));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
  filterGrid('key', '7');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?find=key%3A7');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE/5);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim()), 'home.welcome');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-translation-key:eq(0)').text().trim()), 'home.welcome');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-translation-key:eq(0)').text().trim(), ATD.keyOneGrid);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,"GET",null,{},200,ATF.sorted('key'));
  visitSync(I18N_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-data').length, 0);
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  click('.t-sort-key-dir');
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
  visit(I18N_LIST_URL);
  click('.t-filter-key');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  // let find_two = PREFIX + BASE_URL + '/?page=1';
  // xhr(find_two ,"GET",null,{},200,ATF.sorted(''));
  let find_one = PREFIX + BASE_URL + '/?page=1&key__icontains=7';
  xhr(find_one ,"GET",null,{},200,ATF.fulltext('key', 1));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.ok(!find('.t-filter-key').hasClass('on'));
  });
  filterGrid('key', '7');
  andThen(() => {
    assert.ok(find('.t-filter-key').hasClass('on'));
  });
  filterGrid('key', '');
  andThen(() => {
    assert.ok(!find('.t-filter-key').hasClass('on'));
  });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=key&search=4&key__icontains=4';
  xhr(option_three ,'GET',null,{},200,ATF.sorted('key:4'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=key&search=4';
  xhr(option_two ,'GET',null,{},200,ATF.sorted('key:4'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one ,'GET',null,{},200,ATF.searched('4', 'id'));
  visit(I18N_LIST_URL);
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?search=4');
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?search=4&sort=key');
  });
  filterGrid('key', '4');
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + '?find=key%3A4&search=4&sort=key');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
  });
  click('.t-filter-key');
  andThen(() => {
    let key_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(key_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one, 'GET', null, {}, 200, ATF.searched('4', 'id'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Translations`);
  });
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=4');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-page-count').text(), '2 Translations');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL+'?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Translations`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,ATF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,ATF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,ATF.list_two());
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    pagination(assert);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), I18N_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    pagination2(assert);
  });
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + `?page_size=${PAGE_SIZE}`);
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

test('starting with a page size greater than PAGE_SIZE will set the selected', function(assert) {
  clearxhr(list_xhr);
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,ATF.paginated(updated_pg_size));
  visit(I18N_LIST_URL + `?page_size=${updated_pg_size}`);
  andThen(() => {
    assert.equal(currentURL(),I18N_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,'GET',null,{},200,ATF.sorted('key'));
  visit(I18N_LIST_URL);
  click('.t-sort-key-dir');
  click('.t-show-save-filterset-modal');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
  click('.t-grid-search-input');
  andThen(() => {
    isNotFocused('.ember-modal-dialog input:first');
  });
});

test('save filterset will fire off xhr and add item to the sidebar navigation', function(assert) {
  random.uuid = function() { return UUID.value; };
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,'GET',null,{},200,ATF.sorted('key'));
  let name = 'foobar';
  let routePath = 'admin.translations.index';
  let url = window.location.toString();
  let query = '?sort=key';
  let section = '.t-grid-wrap';
  let navigation = '.t-filterset-wrap li';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(I18N_LIST_URL);
  click('.t-sort-key-dir');
  click('.t-show-save-filterset-modal');
  xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
  saveFilterSet(name, routePath);
  andThen(() => {
    let html = find(section);
    assert.equal(html.find(navigation).length, 1);
    let filterset = store.find('filterset', UUID.value);
    assert.equal(filterset.get('name'), name);
    assert.equal(filterset.get('endpoint_name'), routePath);
    assert.equal(filterset.get('endpoint_uri'), query);
  });
});

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
  let name = 'foobar';
  let routePath = 'admin.translations.index';
  let query = '?foo=bar';
  let navigation = '.t-filterset-wrap li';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(I18N_LIST_URL);
  clearAll(store, 'filterset');
  andThen(() => {
    run(function() {
      store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
    });
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
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
  xhr(sort_one ,'GET',null,{},200,ATF.sorted('key'));
  visit(I18N_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 0);
  });
  click('.t-sort-key-dir');
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 1);
  });
});
