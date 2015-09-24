import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const DJANGO_LOCATION_URL = '/admin/locations/';
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

module('Acceptance | location-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint ,"GET",null,{},200,LOCATION_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-title').text(), 'Locations');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
        assert.equal(find('.t-grid-data:eq(0) .t-location-number').text(), LOCATION_DEFAULTS.storeNumber + '1');
        assert.equal(find('.t-grid-data:eq(0) .t-location-status').text(), LOCATION_DEFAULTS.status);
        assert.equal(find('.t-grid-data:eq(0) .t-location-location_level').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
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
    xhr(page_two ,"GET",null,{},200,LOCATION_FIXTURES.list_two());
    visit(LOCATION_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname11');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
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
    xhr(page_two ,"GET",null,{},200,LOCATION_FIXTURES.list_two());
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('number,name', 1));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name', 2));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2&sort=name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname11');
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
});

test('typing a search will reset page to 1 and require an additional xhr', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=number&search=14';
    xhr(search_two ,"GET",null,{},200,LOCATION_FIXTURES.searched('14', 'number'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=number';
    xhr(page_two ,"GET",null,{},200,LOCATION_FIXTURES.searched('', 'number', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=number';
    xhr(page_one ,"GET",null,{},200,LOCATION_FIXTURES.searched('', 'number'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=number&search=4';
    xhr(sort_one ,"GET",null,{},200,LOCATION_FIXTURES.searched('4', 'number'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,LOCATION_FIXTURES.searched('4', 'id'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'ABC1234');
        assert.equal(find('.t-grid-data:eq(1) .t-location-name').text(), 'vzoname14');
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4&sort=number');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'ABC1234');
        assert.equal(find('.t-grid-data:eq(1) .t-location-name').text(), 'vzoname14');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=&sort=number');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?page=2&search=&sort=number');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname11');
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=14&sort=number');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname14');
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('number,name', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=name,number';
    xhr(sort_four ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name,number', 1));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,number';
    xhr(sort_three ,"GET",null,{},200,LOCATION_FIXTURES.sorted('-name,number', 1));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('number,name', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
        assert.equal(find('.t-reset-sort-order').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=-name%2Cnumber');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'ABC1239');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name%2Cnumber');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    click('.t-reset-sort-order');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
});

test('full text search will filter down the result set and query django accordingly', function(assert) {
    let find_two = PREFIX + BASE_URL + '/?page=1&number__icontains=num&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('number:num,name:7', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&number__icontains=num';
    xhr(find_one ,"GET",null,{},200,LOCATION_FIXTURES.fulltext('number:num', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LOCATION_DEFAULTS.storeName);
    });
    filterGrid('number', 'num');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=number%3Anum');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname11');
    });
    filterGrid('name', '7');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=number%3Anum%2Cname%3A7');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname17');
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name', 1));
    visitSync(LOCATION_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-data').length, 0);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
    click('.t-sort-name-dir');
    Ember.run.later(function() {
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(find('.t-grid-loading-graphic').length, 0);
    });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
    visit(LOCATION_URL);
    click('.t-filter-name');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click('.t-filter-number');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

test('full text searched columns will have a special on css class when active', function(assert) {
    let find_three = PREFIX + BASE_URL + '/?page=1&number__icontains=&name__icontains=7';
    xhr(find_three ,"GET",null,{},200,LOCATION_FIXTURES.sorted('name:7', 1));
    let find_two = PREFIX + BASE_URL + '/?page=1&number__icontains=num&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,LOCATION_FIXTURES.sorted('number:num,name:7', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&number__icontains=num';
    xhr(find_one ,"GET",null,{},200,LOCATION_FIXTURES.fulltext('number:num', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.ok(!find('.t-filter-name').hasClass('on'));
        assert.ok(!find('.t-filter-number').hasClass('on'));
    });
    filterGrid('number', 'num');
    andThen(() => {
        assert.ok(!find('.t-filter-name').hasClass('on'));
        assert.ok(find('.t-filter-number').hasClass('on'));
    });
    filterGrid('name', '7');
    andThen(() => {
        assert.ok(find('.t-filter-name').hasClass('on'));
        assert.ok(find('.t-filter-number').hasClass('on'));
    });
    filterGrid('number', '');
    andThen(() => {
        assert.ok(find('.t-filter-name').hasClass('on'));
        assert.ok(!find('.t-filter-number').hasClass('on'));
    });
});
