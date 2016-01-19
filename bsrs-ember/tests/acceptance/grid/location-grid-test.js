import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LF from 'bsrs-ember/vendor/location_fixtures';
import LD from 'bsrs-ember/vendor/defaults/location';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_locations_url;
const LOCATION_URL = BASE_URL + '/index';
const DJANGO_LOCATION_URL = '/admin/locations/';
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const LETTER_R = {keyCode: 82};
const LETTER_C = {keyCode: 67};
const BACKSPACE = {keyCode: 8};
const SORT_STATUS_DIR = '.t-sort-status-translated-name-dir';

var application, store, endpoint, list_xhr, original_uuid;

module('Acceptance | location-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint ,"GET",null,{},200,LF.list());
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, (assert) => {
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-title').text(), 'Locations');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
        assert.equal(find('.t-grid-data:eq(1) .t-location-number').text(), LD.storeNumber + '2');
        // assert.equal(find('.t-grid-data:eq(0) .t-location-status').text(), LD.status);//put back once get grid v2 out
        assert.equal(find('.t-grid-data:eq(0) .t-location-location_level').text(), LLD.nameCompany);
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
    xhr(page_two ,"GET",null,{},200,LF.list_two());
    visit(LOCATION_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-name').text()), 'vzoname');
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
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
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
    xhr(page_two ,"GET",null,{},200,LF.list_two());
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LF.sorted('number,name'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,LF.sorted('name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LF.sorted('name'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL + '?page=2&sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), `vzoname${PAGE_SIZE+1}`);
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
});

test('aaron typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=number&search=14';
    xhr(search_two ,"GET",null,{},200,LF.searched('14', 'number'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=number';
    xhr(page_two ,"GET",null,{},200,LF.searched('', 'number', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=number';
    xhr(page_one ,"GET",null,{},200,LF.searched('', 'number'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=number&search=4';
    xhr(sort_one ,"GET",null,{},200,LF.searched('4', 'number'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,LF.searched('4', 'id'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-name').text()), 'ABC');
        assert.equal(find('.t-grid-data:eq(1) .t-location-name').text(), 'vzoname14');
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4&sort=number');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-name').text()), 'ABC');
        assert.equal(find('.t-grid-data:eq(1) .t-location-name').text(), 'vzoname14');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=&sort=number');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?page=2&search=&sort=number');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), `vzoname${PAGE_SIZE+1}`);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=14&sort=number');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), 'vzoname14');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LF.sorted('number,name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LF.sorted('name'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=name,number';
    xhr(sort_four ,"GET",null,{},200,LF.sorted('name,number'));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,number';
    xhr(sort_three ,"GET",null,{},200,LF.sorted('-name,number'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=number,name';
    xhr(sort_two ,"GET",null,{},200,LF.sorted('number,name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LF.sorted('name'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
        assert.equal(find('.t-reset-grid').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-sort-number-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=number%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=-name%2Cnumber');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), `vzoname${PAGE_SIZE*2-1}`);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?sort=name%2Cnumber');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-number-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    let find_two = PREFIX + BASE_URL + '/?page=1&number__icontains=num&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,LF.sorted('number:num,name:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&number__icontains=num';
    xhr(find_one ,"GET",null,{},200,LF.fulltext('number:num', 1));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
    filterGrid('number', 'num');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=number%3Anum');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), `vzoname${PAGE_SIZE+1}`);
    });
    filterGrid('name', '7');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=number%3Anum%2Cname%3A7');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-location-name').text()), 'vzoname');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-name').text(), LD.storeName);
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LF.sorted('name'));
    visitSync(LOCATION_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
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
    xhr(find_three ,"GET",null,{},200,LF.sorted('name:7'));
    let find_two = PREFIX + BASE_URL + '/?page=1&number__icontains=num&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,LF.sorted('number:num,name:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&number__icontains=num';
    xhr(find_one ,"GET",null,{},200,LF.fulltext('number:num', 1));
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

test('after you reset the grid the filter model will also be reset', function(assert) {
    let option_three = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4&name__icontains=4';
    xhr(option_three ,'GET',null,{},200,LF.sorted('name:4'));
    let option_two = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4';
    xhr(option_two ,'GET',null,{},200,LF.sorted('name:4'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,LF.searched('4', 'id'));
    visit(LOCATION_URL);
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4&sort=name');
    });
    filterGrid('name', '4');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=name%3A4&search=4&sort=name');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
    });
    click('.t-filter-name');
    andThen(() => {
        let name_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(name_filter_value, '');
    });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,LF.searched('4', 'id'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Locations`);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=4');
        //TODO: NOT MATCHING UP
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-page-count').text(), '2 Locations');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Locations`);
    });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
    let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
    xhr(option_two, 'GET',null,{},200,LF.paginated(PAGE_SIZE));
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,LF.paginated(updated_pg_size));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,LF.list_two());
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
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
        assert.equal(currentURL(), LOCATION_URL + '?page=2');
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
        assert.equal(currentURL(),LOCATION_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
    alterPageSize('.t-page-size', PAGE_SIZE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + `?page_size=${PAGE_SIZE}`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
        var pagination = find('.t-pages');
        //TODO: see if this is wrong
        // assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        // assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
    clearxhr(list_xhr);
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,LF.paginated(updated_pg_size));
    visit(LOCATION_URL + `?page_size=${updated_pg_size}`);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,LF.sorted('name'));
    visit(LOCATION_URL);
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

test('save filterset will fire off xhr and add item to the sidebar navigation', function(assert) {
    random.uuid = function() { return UUID.value; };
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,LF.sorted('name'));
    let name = 'foobar';
    let routePath = 'admin.locations.index';
    let url = window.location.toString();
    let query = '?sort=name';
    let section = '.t-grid-wrap';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(LOCATION_URL);
    click('.t-sort-name-dir');
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
    let routePath = 'admin.locations.index';
    let query = '?foo=bar';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(LOCATION_URL);
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
    xhr(sort_one ,'GET',null,{},200,LF.sorted('name'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});

test('status.translated_name is a functional related filter', function(assert) {
    let option_four = PREFIX + BASE_URL + '/?page=1&ordering=-status__name&status__name__icontains=cl';
    xhr(option_four,'GET',null,{},200,LF.searched_related(LDS.closedId, 'status'));
    let option_three = PREFIX + BASE_URL + '/?page=1&ordering=-status__name';
    xhr(option_three,'GET',null,{},200,LF.searched_related(LDS.closedId, 'status'));
    let option_two = PREFIX + BASE_URL + '/?page=1&ordering=status__name';
    xhr(option_two,'GET',null,{},200,LF.searched_related(LD.openId, 'status'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=cl';
    xhr(option_one,'GET',null,{},200,LF.searched_related(LDS.closedId, 'status'));
    visit(LOCATION_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-location-status-translated_name').text(), t(LDS.openName));
    });
    fillIn('.t-grid-search-input', 'cl');
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_C);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=cl');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-status-translated_name').text(), t(LDS.closedName));
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=');
        assert.equal(find('.t-grid-data:eq(0) .t-location-status-translated_name').text(), t(LDS.openName));
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    });
    click(SORT_STATUS_DIR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=&sort=status.translated_name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-status-translated_name').text(), t(LDS.closedName));
    });
    click(SORT_STATUS_DIR);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?search=&sort=-status.translated_name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-location-status-translated_name').text(), t(LDS.openName));
    });
    filterGrid('status.translated_name', 'cl');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_URL + '?find=status.translated_name%3Acl&search=&sort=-status.translated_name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-status-translated_name').text(), t(LDS.closedName));
    });
});
