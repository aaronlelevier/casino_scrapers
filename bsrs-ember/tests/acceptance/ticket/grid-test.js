import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TF from 'bsrs-ember/vendor/ticket_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import LD from 'bsrs-ember/vendor/defaults/location';
import PD from 'bsrs-ember/vendor/defaults/person';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const NUMBER_ONE = {keyCode: 49};
const LETTER_R = {keyCode: 82};
const LETTER_O = {keyCode: 79};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};
const SORT_PRIORITY_DIR = '.t-sort-priority-name-dir';
const SORT_STATUS_DIR = '.t-sort-status-name-dir';
const SORT_LOCATION_DIR = '.t-sort-location-name-dir';
const SORT_ASSIGNEE_DIR = '.t-sort-assignee-fullname-dir';
const FILTER_PRIORITY = '.t-filter-priority-name';

var application, store, endpoint, list_xhr, original_uuid;

module('sco Acceptance | ticket grid test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, TF.list());
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-priority-name').text(), TD.priorityOne);
        var pagination = find('.t-pages');
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
    visit(TICKET_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
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
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&related_ordering=request,priority__name';
    xhr(sort_two ,"GET",null,{},200,TF.sorted('request,priority'));
    var page_two = PREFIX + BASE_URL + '/?page=2&related_ordering=priority__name';
    xhr(page_two ,"GET",null,{},200,TF.sorted('priority'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,"GET",null,{},200,TF.sorted('priority'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?sort=priority.name');
        assert.equal(find('.t-grid-data').length, 10);
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOtherGrid);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2&sort=priority.name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Cpriority.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=request&search=14';
    xhr(search_two ,"GET",null,{},200,TF.searched('14', 'request'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=request';
    xhr(page_two ,"GET",null,{},200,TF.searched('', 'request', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=request';
    xhr(page_one ,"GET",null,{},200,TF.searched('', 'request'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=request&search=4';
    xhr(sort_one ,"GET",null,{},200,TF.searched('4', 'request'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,TF.searched('4', 'id'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestFourGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-ticket-request').text(), TD.requestFourteenGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4&sort=request');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestFourteenGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-ticket-request').text(), TD.requestFourGrid);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=request');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?page=2&search=&sort=request');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOtherGrid);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=14&sort=request');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestFourteenGrid);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&related_ordering=request,priority__name';
    xhr(sort_two ,"GET",null,{},200,TF.sorted('request,priority'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,"GET",null,{},200,TF.sorted('priority'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=priority.name');
        assert.equal(find('.t-grid-data').length, 10);
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Cpriority.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name,request';
    xhr(sort_four ,"GET",null,{},200,TF.sorted('priority,request'));
    var sort_three = PREFIX + BASE_URL + '/?page=1&related_ordering=-priority__name,request';
    xhr(sort_three ,"GET",null,{},200,TF.sorted('-priority,request'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&related_ordering=request,priority__name';
    xhr(sort_two ,"GET",null,{},200,TF.sorted('request,priority'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,"GET",null,{},200,TF.sorted('priority'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort'));
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
        assert.equal(find('.t-reset-grid').length, 0);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=priority.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Cpriority.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=-priority.name%2Crequest');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-desc'));
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastPage2Grid);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=priority.name%2Crequest');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    let find_three = PREFIX + BASE_URL + '/?page=1&request__icontains=&priority__name__icontains=h';
    xhr(find_three, "GET",null,{},200,TF.sorted('id'));
    let find_two = PREFIX + BASE_URL + '/?page=1&request__icontains=';
    xhr(find_two ,"GET",null,{},200,TF.sorted('id'));
    let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=ape';
    xhr(find_one ,"GET",null,{},200,TF.fulltext('request:ape', 1));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    filterGrid('request', 'ape');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=request%3Aape');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    filterGrid('request', '');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=request%3A');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    filterGrid('priority.name', 'h');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=request%3A%2Cpriority.name%3Ah');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,"GET",null,{},200,TF.sorted('priority'));
    visitSync(TICKET_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-data').length, 0);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
    click(SORT_PRIORITY_DIR);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
    visit(TICKET_URL);
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
    let find_three = PREFIX + BASE_URL + '/?page=1&request__icontains=&priority__name__icontains=7';
    xhr(find_three ,"GET",null,{},200,TF.sorted('priority:7'));
    let find_two = PREFIX + BASE_URL + '/?page=1&request__icontains=num&priority__name__icontains=7';
    xhr(find_two ,"GET",null,{},200,TF.sorted('request:num,priority:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=num';
    xhr(find_one ,"GET",null,{},200,TF.fulltext('request:num', 1));
    visit(TICKET_URL);
    andThen(() => {
        assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
        assert.ok(!find('.t-filter-request').hasClass('on'));
    });
    filterGrid('request', 'num');
    andThen(() => {
        assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
        assert.ok(find('.t-filter-request').hasClass('on'));
    });
    filterGrid('priority.name', '7');
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
    let option_three = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name&search=4&priority__name__icontains=4';
    xhr(option_three ,'GET',null,{},200,TF.sorted('priority:4'));
    let option_two = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name&search=4';
    xhr(option_two ,'GET',null,{},200,TF.sorted('priority:4'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TF.searched('4', 'id'));
    visit(TICKET_URL);
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4');
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4&sort=priority.name');
    });
    filterGrid('priority.name', '4');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=priority.name%3A4&search=4&sort=priority.name');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
    click(FILTER_PRIORITY);
    andThen(() => {
        let priority_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(priority_filter_value, '');
    });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TF.searched('4', 'id'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(find('.t-grid-data').length, 10);
        // assert.equal(find('.t-page-count').text(), '19 Tickets');
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        // assert.equal(find('.t-page-count').text(), '2 Tickets');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=');
        assert.equal(find('.t-grid-data').length, 10);
        // assert.equal(find('.t-page-count').text(), '19 Tickets');
    });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
    let option_two = PREFIX + BASE_URL + '/?page=1&page_size=10';
    xhr(option_two, 'GET',null,{},200,TF.paginated(10));
    let option_one = PREFIX + BASE_URL + '/?page=1&page_size=25';
    xhr(option_one, 'GET',null,{},200,TF.paginated(25));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,TF.list_two());
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-page-size option:selected').text(), '10 per page');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    alterPageSize('.t-page-size', 25);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?page_size=25');
        assert.equal(find('.t-grid-data').length, 19);
        assert.equal(find('.t-page-size option:selected').text(), '25 per page');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
    alterPageSize('.t-page-size', 10);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?page_size=10');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-page-size option:selected').text(), '10 per page');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('starting with a page size greater than 10 will set the selected', function(assert) {
    clearxhr(list_xhr);
    let option_one = PREFIX + BASE_URL + '/?page=1&page_size=25';
    xhr(option_one, 'GET',null,{},200,TF.paginated(25));
    visit(TICKET_URL + '?page_size=25');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?page_size=25');
        assert.equal(find('.t-grid-data').length, 19);
        assert.equal(find('.t-page-size option:selected').text(), '25 per page');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
    visit(TICKET_URL);
    click(SORT_PRIORITY_DIR);
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
    let name = 'foobar';
    let routePath = 'tickets.index';
    let url = window.location.toString();
    let query = url.slice(url.indexOf('?'));
    let section = '.t-grid-wrap';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(TICKET_URL);
    click(SORT_PRIORITY_DIR);
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
    let routePath = 'tickets.index';
    let query = '?foo=bar';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(TICKET_URL);
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&related_ordering=priority__name';
    xhr(sort_one ,'GET',null,{},200,TF.sorted('priority'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click(SORT_PRIORITY_DIR);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});

test('status.name is a functional related filter', function(assert) {
    let option_four = PREFIX + BASE_URL + '/?page=1&related_ordering=-status__name&status__name__icontains=rr';
    xhr(option_four,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
    let option_three = PREFIX + BASE_URL + '/?page=1&related_ordering=-status__name';
    xhr(option_three,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
    let option_two = PREFIX + BASE_URL + '/?page=1&related_ordering=status__name';
    xhr(option_two,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=rr';
    xhr(option_one,'GET',null,{},200,TF.searched_related(TD.statusTwoId, 'status'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusOneKey));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    fillIn('.t-grid-search-input', 'rr');
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=rr');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusTwoKey));
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=');
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusOneKey));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
        assert.equal(find('.t-grid-data').length, 10);
    });
    click(SORT_STATUS_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=status.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusTwoKey));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    click(SORT_STATUS_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=-status.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusOneKey));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    filterGrid('status.name', 'rr');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=status.name%3Arr&search=&sort=-status.name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-status-name').text(), t(TD.statusTwoKey));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
});

test('location.name is a functional related filter', function(assert) {
    let option_four = PREFIX + BASE_URL + '/?page=1&related_ordering=-location__name&location__name__icontains=ow';
    xhr(option_four,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
    let option_three = PREFIX + BASE_URL + '/?page=1&related_ordering=-location__name';
    xhr(option_three,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
    let option_two = PREFIX + BASE_URL + '/?page=1&related_ordering=location__name';
    xhr(option_two,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=ow';
    xhr(option_one,'GET',null,{},200,TF.searched_related(TD.locationTwoId, 'location'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), LD.storeName);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    fillIn('.t-grid-search-input', 'ow');
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_O);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=ow');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), TD.locationTwo);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=');
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), LD.storeName);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
        assert.equal(find('.t-grid-data').length, 10);
    });
    click(SORT_LOCATION_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=location.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), LD.storeName);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOtherGrid);
    });
    click(SORT_LOCATION_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=-location.name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), TD.locationTwo);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), 'ape12');
    });
    filterGrid('location.name', 'ow');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=location.name%3Aow&search=&sort=-location.name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-location-name').text(), TD.locationTwo);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
});

test('assignee.fullname is a functional related filter', function(assert) {
    let option_four = PREFIX + BASE_URL + '/?page=1&related_ordering=-assignee__fullname&assignee__fullname__icontains=ra';
    xhr(option_four,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
    let option_three = PREFIX + BASE_URL + '/?page=1&related_ordering=-assignee__fullname';
    xhr(option_three,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
    let option_two = PREFIX + BASE_URL + '/?page=1&related_ordering=assignee__fullname';
    xhr(option_two,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=ra';
    xhr(option_one,'GET',null,{},200,TF.searched_related(TD.assigneeTwoId, 'assignee'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), PD.fullname);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
    });
    fillIn('.t-grid-search-input', 'ra');
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=ra');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=');
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), PD.fullname);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOneGrid);
        assert.equal(find('.t-grid-data').length, 10);
    });
    click(SORT_ASSIGNEE_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=assignee.fullname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), PD.fullname);
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestOtherGrid);
    });
    click(SORT_ASSIGNEE_DIR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=-assignee.fullname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
        // assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), 'ape12');
    });
    filterGrid('assignee.fullname', 'ra');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=assignee.fullname%3Ara&search=&sort=-assignee.fullname');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-assignee-fullname').text(), `${TD.assigneeTwo} ${TD.assigneeTwo}`);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TD.requestLastGrid);
    });
});
