import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { TICKET_LIST_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
// import timemachine from 'vendor/timemachine';
import moment from 'moment';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_tickets_url;
const NUMBER_ONE = {keyCode: 49};
const LETTER_R = {keyCode: 82};
const LETTER_O = {keyCode: 79};
const LETTER_X = {keyCode: 88};
const NUMBER_FOUR = {keyCode: 52};
const NUMBER_FIVE = {keyCode: 53};
const BACKSPACE = {keyCode: 8};
const SORT_LOCATION_DIR = '.t-sort-location-name-dir';
const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
const FILTER_PRIORITY = '.t-filter-priority-translated-name';

var application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | ticket grid test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint, 'GET', null, {}, 200, TF.list());
  },
});

test('initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr', function(assert) {
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Tickets');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), LD.baseStoreName);
    assert.ok(find('.t-grid-data:eq(0) .t-ticket-priority-emergency'));
    assert.ok(find('.t-grid-data:eq(0) .t-ticket-status-new'));
    const time = moment(new Date()).calendar();
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-created').text().trim(), `${time}`);
    const pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,TF.list_two());
  visit(TICKET_LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const tickets_all = store.find('ticket-list');
    assert.equal(tickets_all.get('length'), 9);
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
    const time = moment(new Date()).calendar();
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-created').text().trim(), `${time}`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const tickets_all = store.find('ticket-list');
    assert.equal(tickets_all.get('length'), 10);
    assert.equal(currentURL(),TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    const time = moment(new Date()).calendar();
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-created').text().trim(), `${time}`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  var page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,TF.list_two());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,location__name';
  xhr(sort_two ,"GET",null,{},200,TF.sorted('request,location'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=location__name';
  xhr(page_two ,"GET",null,{},200,TF.sorted_page_two('location'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,"GET",null,{},200,TF.sorted('location'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?sort=location.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2&sort=location.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
  });
  click('.t-sort-request-dir');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=request%2Clocation.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  var search_two = PREFIX + BASE_URL + '/?page=1&ordering=request&search=14';
  xhr(search_two ,"GET",null,{},200,TF.searched('14', 'request'));
  var page_two = PREFIX + BASE_URL + '/?page=2&ordering=request';
  xhr(page_two ,"GET",null,{},200,TF.searched('', 'request', 2));
  var page_one = PREFIX + BASE_URL + '/?page=1&ordering=request';
  xhr(page_one ,"GET",null,{},200,TF.searched('', 'request'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=request&search=5';
  xhr(sort_one ,"GET",null,{},200,TF.searched('5', 'request'));
  var search_one = PREFIX + BASE_URL + '/?page=1&search=5';
  xhr(search_one ,"GET",null,{},200,TF.searched('5', 'name'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  fillIn('.t-grid-search-input', '5');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=5');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-ticket-request').text().trim()), 'subb');
  });
  click('.t-sort-request-dir');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=5&sort=request');
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-ticket-request').text().trim()), 'subb');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=&sort=request');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?page=2&search=&sort=request');
    // assert.equal(find('.t-grid-data').length, 22);//firefox discerepency
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'subb');
  });
  fillIn('.t-grid-search-input', '14');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=14&sort=request');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), 'ape14');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,location__name';
  xhr(sort_two ,"GET",null,{},200,TF.sorted('request,location'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,"GET",null,{},200,TF.sorted('location'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=location.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  click('.t-sort-request-dir');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=request%2Clocation.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=request';
  xhr(sort_four ,"GET",null,{},200,TF.sorted('location,request'));
  var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-location__name,request';
  xhr(sort_three ,"GET",null,{},200,TF.sorted('-location,request'));
  var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,location__name';
  xhr(sort_two ,"GET",null,{},200,TF.sorted('request,location'));
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,"GET",null,{},200,TF.sorted('location'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find(SORT_LOCATION_DIR).hasClass('fa-sort'));
    assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
    assert.equal(find('.t-reset-grid').length, 0);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=location.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find(SORT_LOCATION_DIR).hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
    // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), 'sub13');
  });
  click('.t-sort-request-dir');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=request%2Clocation.name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
    assert.ok(find(SORT_LOCATION_DIR).hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=-location.name%2Crequest');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
    assert.ok(find(SORT_LOCATION_DIR).hasClass('fa-sort-desc'));
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?sort=request');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
    assert.ok(!find(SORT_LOCATION_DIR).hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  let find_three = PREFIX + BASE_URL + '/?page=1&priority__name__icontains=h';
  xhr(find_three, "GET",null,{},200,TF.sorted('id'));
  let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=ape';
  xhr(find_one ,"GET",null,{},200,TF.fulltext('request:ape', 1));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  filterGrid('request', 'ape');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?find=request%3Aape');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  filterGrid('request', '');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?find=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
  filterGrid('priority.name', 'h');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?find=priority.name%3Ah');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestLastGrid);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,"GET",null,{},200,TF.sorted('priority'));
  visitSync(TICKET_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-data').length, 0);
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  click(SORT_LOCATION_DIR);
  Ember.run.later(function() {
    // assert.equal(find('.t-grid-loading-graphic').length, 1);
  }, 0);
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
  visit(TICKET_LIST_URL);
  click(FILTER_PRIORITY);
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
  click('.t-filter-request');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  let find_three = PREFIX + BASE_URL + '/?page=1&priority__name__icontains=7';
  xhr(find_three ,"GET",null,{},200,TF.sorted('priority:7'));
  let find_two = PREFIX + BASE_URL + '/?page=1&request__icontains=num&priority__name__icontains=7';
  xhr(find_two ,"GET",null,{},200,TF.sorted('request:num,priority:7'));
  let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=num';
  xhr(find_one ,"GET",null,{},200,TF.fulltext('request:num', 1));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
    assert.ok(!find('.t-filter-request').hasClass('on'));
  });
  filterGrid('request', 'num');
  andThen(() => {
    assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
    assert.ok(find('.t-filter-request').hasClass('on'));
  });
  filterGrid('priority.translated_name', '7');
  andThen(() => {
    assert.ok(find(FILTER_PRIORITY).hasClass('on'));
    assert.ok(find('.t-filter-request').hasClass('on'));
  });
  filterGrid('request', '');
  andThen(() => {
    assert.ok(find(FILTER_PRIORITY).hasClass('on'));
    assert.ok(!find('.t-filter-request').hasClass('on'));
  });
});

//todo-update to searched related before we commit
test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=location__name&search=4&priority__name__icontains=4';
  xhr(option_three ,'GET',null,{},200,TF.sorted('priority:4'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=location__name&search=4';
  xhr(option_two ,'GET',null,{},200,TF.sorted('priority:4'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
  xhr(option_one ,'GET',null,{},200,TF.searched('4', 'id'));
  visit(TICKET_LIST_URL);
  fillIn('.t-grid-search-input', '4');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=4');
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=4&sort=location.name');
  });
  filterGrid('priority.translated_name', '4');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?find=priority.translated_name%3A4&search=4&sort=location.name');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
  });
  click(FILTER_PRIORITY);
  andThen(() => {
    let priority_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(priority_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX + BASE_URL + '/?page=1&search=6';
  xhr(option_one ,'GET',null,{},200,TF.searched('6', 'name'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Tickets`);
  });
  fillIn('.t-grid-search-input', '6');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=6');
    // assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-page-count').text(), '2 Tickets');
  });
  // this tests that a space will be trimmed in the grid-search-input component
  fillIn('.t-grid-search-input', ' ');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + '?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Tickets`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,TF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,TF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,TF.list_two());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    const grid_count = store.find('grid-count', 1);
    assert.equal(grid_count.get('count'), updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${PAGE_SIZE}`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
  clearxhr(list_xhr);
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,TF.paginated(updated_pg_size));
  visit(TICKET_LIST_URL + `?page_size=${updated_pg_size}`);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,'GET',null,{},200,TF.sorted('location'));
  visit(TICKET_LIST_URL);
  click(SORT_LOCATION_DIR);
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
//   var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
//   xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
//   let name = 'foobar';
//   let routePath = 'tickets.index';
//   let url = window.location.toString();
//   let query = '?sort=priority.name';
//   let section = '.t-grid-wrap';
//   let navigation = '.t-filterset-wrap li';
//   let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//   visit(TICKET_LIST_URL);
//   click(SORT_LOCATION_DIR);
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

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
  let name = 'foobar';
  let routePath = 'tickets.index';
  let query = '?foo=bar';
  let navigation = '.t-filterset-wrap div';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(TICKET_LIST_URL);
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
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
  xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 0);
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 1);
  });
});

// test('status.name is a functional related filter', function(assert) {
//   let option_four = PREFIX + BASE_URL + '/?page=1&status__name__icontains=rr';
//   xhr(option_four,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
//   let option_one = PREFIX + BASE_URL + '/?page=1&search=r';
//   xhr(option_one,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
//   visit(TICKET_LIST_URL);
//   andThen(() => {
//     assert.equal(currentURL(), TICKET_LIST_URL);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-translated_name').text().trim(), t(TD.statusOneKey));
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//   });
//   fillIn('.t-grid-search-input', 'r');
//   triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=r');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-translated_name').text().trim(), t(TD.statusTwoKey));
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   fillIn('.t-grid-search-input', '');
//   triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=');
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-translated_name').text().trim(), t(TD.statusOneKey));
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//   });
//   filterGrid('status.name', 'rr');
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?find=status.name%3Arr&search=');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-translated_name').text().trim(), t(TD.statusTwoKey));
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
// });

// test('location.name is a functional related filter', function(assert) {
//   let option_four = PREFIX + BASE_URL + '/?page=1&ordering=-location__name&location__name__icontains=ow';
//   xhr(option_four,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
//   let option_three = PREFIX + BASE_URL + '/?page=1&ordering=-location__name';
//   xhr(option_three,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
//   let option_two = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
//   xhr(option_two,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
//   let option_one = PREFIX + BASE_URL + '/?page=1&search=ow';
//   xhr(option_one,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
//   visit(TICKET_LIST_URL);
//   andThen(() => {
//     assert.equal(currentURL(), TICKET_LIST_URL);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), LD.storeName);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//   });
//   fillIn('.t-grid-search-input', 'ow');
//   triggerEvent('.t-grid-search-input', 'keyup', LETTER_O);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=ow');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), TD.locationTwo);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   fillIn('.t-grid-search-input', '');
//   triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=');
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), LD.storeName);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//   });
//   click(SORT_LOCATION_DIR);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=&sort=location.name');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), TD.locationTwo);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   click(SORT_LOCATION_DIR);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=&sort=-location.name');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), TD.locationTwo);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   filterGrid('location.name', 'ow');
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?find=location.name%3Aow&search=&sort=-location.name');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text().trim(), TD.locationTwo);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
// });

// test('assignee.fullname is a functional related filter', function(assert) {
//   let option_four = PREFIX + BASE_URL + '/?page=1&ordering=-assignee__fullname&assignee__fullname__icontains=ra';
//   xhr(option_four,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
//   let option_three = PREFIX + BASE_URL + '/?page=1&ordering=-assignee__fullname';
//   xhr(option_three,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
//   let option_two = PREFIX + BASE_URL + '/?page=1&ordering=assignee__fullname';
//   xhr(option_two,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
//   let option_one = PREFIX + BASE_URL + '/?page=1&search=ra';
//   xhr(option_one,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
//   visit(TICKET_LIST_URL);
//   andThen(() => {
//     assert.equal(currentURL(), TICKET_LIST_URL);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), PD.fullname);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//   });
//   fillIn('.t-grid-search-input', 'ra');
//   triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=ra');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   fillIn('.t-grid-search-input', '');
//   triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=');
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), PD.fullname);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text().trim(), TD.requestOneGrid);
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//   });
//   click(SORT_ASSIGNEE_DIR);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=&sort=assignee.fullname');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   click(SORT_ASSIGNEE_DIR);
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?search=&sort=-assignee.fullname');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
//   filterGrid('assignee.fullname', 'ra');
//   andThen(() => {
//     assert.equal(currentURL(),TICKET_LIST_URL + '?find=assignee.fullname%3Ara&search=&sort=-assignee.fullname');
//     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//     assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text().trim(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
//     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-ticket-request').text().trim()), 'ape');
//   });
// });

test('category_names is not sortable/filterable/searchable (display only)', function(assert) {
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-ticket-categories').text().trim(), 'Repair • Plumbing • Toilet Leak');
    assert.equal(find('.t-sort-category-names').length, 0);
    assert.equal(find('.t-sort-category-names-dir').length, 0);
    assert.equal(find('.t-filter-category-names').length, 0);
  });
});

//this test is one of a kind because it does not verify configuration. Instead it covers a single reset function in grid-view.js
test('picking a different number of pages will alter the query string and xhr and reset will not remove page_size from queryParams', function(assert) {
  const updated_pg_size = PAGE_SIZE*2;
  let sort_one = PREFIX + BASE_URL + `/?page=1&ordering=location__name&page_size=${updated_pg_size}`;
  xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,TF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,TF.list_two());
  visit(TICKET_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), TICKET_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-1);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  click(SORT_LOCATION_DIR);
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${updated_pg_size}&sort=location.name`);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(),TICKET_LIST_URL + `?page_size=${updated_pg_size}`);
  });
});

test('grid debounces correctly with structured concurrency', (assert) => {
  visit(TICKET_LIST_URL);
  andThen(() => {
    //SC: hard to test that xhr doesn't get fired but can test if url changes within the DEBOUNCE INTERVAL.  Can't use fillIn
    let option_one = PREFIX + BASE_URL + '/?page=1&search=ra';
    xhr(option_one,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
    $('.t-grid-search-input').val('ra').trigger('change');
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
    var done = assert.async();
    Ember.run.later(() => {
      assert.equal(currentURL(),TICKET_LIST_URL);
      done();
    }, 100);
  });
});

// test('a 400 status code will show up in the error component with duplicate name message', (assert) => {
//   random.uuid = function() { return UUID.value; };
//   visit(TICKET_LIST_URL);
//   var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=location__name';
//   xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
//   click(SORT_LOCATION_DIR);
//   click('.t-show-save-filterset-modal');
//   const exception = 'This name is already taken';
//   let query = '?sort=priority.name';
//   let name = 'foobar';
//   let routePath = 'tickets.index';
//   let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//   xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 400, {});
//   saveFilterSet(name, routePath);
//   andThen(() => {
//     waitFor(assert, () => {
//       assert.equal(Ember.$('.t-save-filterset-error-msg').text(), exception);
//     });
//   });
// });
