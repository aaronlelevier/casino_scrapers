import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TICKET_FIXTURES from 'bsrs-ember/vendor/ticket_fixtures';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKET_URL = BASE_URL + '/index';
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

module('Acceptance | ticket-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, TICKET_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        //assert.equal(find('.t-grid-title').text(), 'Tickets');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-subject').text(), TICKET_DEFAULTS.subjectOneGrid);
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
    xhr(page_two ,"GET",null,{},200,TICKET_FIXTURES.list_two());
    visit(TICKET_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
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
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
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
    xhr(page_two ,"GET",null,{},200,TICKET_FIXTURES.list_two());
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
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,subject';
    xhr(sort_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('request,subject'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=subject';
    xhr(page_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?sort=subject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL + '?page=2&sort=subject');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Csubject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=request&search=14';
    xhr(search_two ,"GET",null,{},200,TICKET_FIXTURES.searched('14', 'request'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=request';
    xhr(page_two ,"GET",null,{},200,TICKET_FIXTURES.searched('', 'request', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=request';
    xhr(page_one ,"GET",null,{},200,TICKET_FIXTURES.searched('', 'request'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=request&search=4';
    xhr(sort_one ,"GET",null,{},200,TICKET_FIXTURES.searched('4', 'request'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,TICKET_FIXTURES.searched('4', 'id'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestFourGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-ticket-request').text(), TICKET_DEFAULTS.requestFourteenGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4&sort=request');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestFourteenGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-ticket-request').text(), TICKET_DEFAULTS.requestFourGrid);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=&sort=request');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?page=2&search=&sort=request');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOtherGrid);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=14&sort=request');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestFourteenGrid);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,subject';
    xhr(sort_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('request,subject'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=subject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Csubject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=subject,request';
    xhr(sort_four ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject,request'));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-subject,request';
    xhr(sort_three ,"GET",null,{},200,TICKET_FIXTURES.sorted('-subject,request'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=request,subject';
    xhr(sort_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('request,subject'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-subject-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
        assert.equal(find('.t-reset-grid').length, 0);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=subject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-subject-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-sort-request-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=request%2Csubject');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-subject-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=-subject%2Crequest');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-subject-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastPage2Grid);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?sort=subject%2Crequest');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-request-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-subject-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    let find_two = PREFIX + BASE_URL + '/?page=1&request__icontains=ape&subject__icontains=7';
    xhr(find_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('request:ape,subject:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=ape';
    xhr(find_one ,"GET",null,{},200,TICKET_FIXTURES.fulltext('request:ape', 1));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
    filterGrid('request', 'ape');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=request%3Aape');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestLastGrid);
    });
    filterGrid('subject', '7');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=request%3Aape%2Csubject%3A7');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), 'ape17');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-ticket-request').text(), TICKET_DEFAULTS.requestOneGrid);
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject'));
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
    click('.t-sort-subject-dir');
    Ember.run.later(function() {
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
    visit(TICKET_URL);
    click('.t-filter-subject');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click('.t-filter-request');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

test('full text searched columns will have a special on css class when active', function(assert) {
    let find_three = PREFIX + BASE_URL + '/?page=1&request__icontains=&subject__icontains=7';
    xhr(find_three ,"GET",null,{},200,TICKET_FIXTURES.sorted('subject:7'));
    let find_two = PREFIX + BASE_URL + '/?page=1&request__icontains=num&subject__icontains=7';
    xhr(find_two ,"GET",null,{},200,TICKET_FIXTURES.sorted('request:num,subject:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&request__icontains=num';
    xhr(find_one ,"GET",null,{},200,TICKET_FIXTURES.fulltext('request:num', 1));
    visit(TICKET_URL);
    andThen(() => {
        assert.ok(!find('.t-filter-subject').hasClass('on'));
        assert.ok(!find('.t-filter-request').hasClass('on'));
    });
    filterGrid('request', 'num');
    andThen(() => {
        assert.ok(!find('.t-filter-subject').hasClass('on'));
        assert.ok(find('.t-filter-request').hasClass('on'));
    });
    filterGrid('subject', '7');
    andThen(() => {
        assert.ok(find('.t-filter-subject').hasClass('on'));
        assert.ok(find('.t-filter-request').hasClass('on'));
    });
    filterGrid('request', '');
    andThen(() => {
        assert.ok(find('.t-filter-subject').hasClass('on'));
        assert.ok(!find('.t-filter-request').hasClass('on'));
    });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
    let option_three = PREFIX + BASE_URL + '/?page=1&ordering=subject&search=4&subject__icontains=4';
    xhr(option_three ,'GET',null,{},200,TICKET_FIXTURES.sorted('subject:4'));
    let option_two = PREFIX + BASE_URL + '/?page=1&ordering=subject&search=4';
    xhr(option_two ,'GET',null,{},200,TICKET_FIXTURES.sorted('subject:4'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TICKET_FIXTURES.searched('4', 'id'));
    visit(TICKET_URL);
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4');
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?search=4&sort=subject');
    });
    filterGrid('subject', '4');
    andThen(() => {
        assert.equal(currentURL(),TICKET_URL + '?find=subject%3A4&search=4&sort=subject');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), TICKET_URL);
    });
    click('.t-filter-subject');
    andThen(() => {
        let subject_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(subject_filter_value, '');
    });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TICKET_FIXTURES.searched('4', 'id'));
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
    xhr(option_two, 'GET',null,{},200,TICKET_FIXTURES.paginated(10));
    let option_one = PREFIX + BASE_URL + '/?page=1&page_size=25';
    xhr(option_one, 'GET',null,{},200,TICKET_FIXTURES.paginated(25));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,TICKET_FIXTURES.list_two());
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
    xhr(option_one, 'GET',null,{},200,TICKET_FIXTURES.paginated(25));
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,'GET',null,{},200,TICKET_FIXTURES.sorted('subject'));
    visit(TICKET_URL);
    click('.t-sort-subject-dir');
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,'GET',null,{},200,TICKET_FIXTURES.sorted('subject'));
    let subject = 'foobar';
    let routePath = 'admin.tickets.index';
    let url = window.location.toString();
    let query = url.slice(url.indexOf('?'));
    let section = '.t-grid-wrap';
    let navigation = '.t-filterset-wrapli';
    let payload = {id: UUID.value, subject: subject, endpoint_subject: routePath, endpoint_uri: query};
    visit(TICKET_URL);
    click('.t-sort-subject-dir');
    click('.t-show-save-filterset-modal');
    xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
    saveFilterSet(subject, routePath);
    andThen(() => {
        let html = find(section);
        assert.equal(html.find(navigation).length, 1);
        let filterset = store.find('filterset', UUID.value);
        assert.equal(filterset.get('subject'), subject);
        assert.equal(filterset.get('endpoint_subject'), routePath);
        assert.equal(filterset.get('endpoint_uri'), query);
    });
});

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
    let name = 'foobar';
    let routePath = 'admin.tickets.index';
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=subject';
    xhr(sort_one ,'GET',null,{},200,TICKET_FIXTURES.sorted('subject'));
    visit(TICKET_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click('.t-sort-subject-dir');
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});
