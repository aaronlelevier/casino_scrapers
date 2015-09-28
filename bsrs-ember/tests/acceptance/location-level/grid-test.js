import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import LOCATION_LEVEL_FIXTURES from 'bsrs-ember/vendor/location_level_fixtures';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_location_levels_url;
const LOCATION_LEVEL_URL = BASE_URL + '/index';
const DJANGO_LOCATION_LEVEL_URL = PREFIX + BASE_URL.replace('-', '_');
const NUMBER_ONE = {keyCode: 49};
const NUMBER_NINE = {keyCode: 57};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

module('Acceptance | location-level-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = DJANGO_LOCATION_LEVEL_URL + '/?page=1';
        list_xhr = xhr(endpoint ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-title').text(), 'Location Levels');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
    var page_two = DJANGO_LOCATION_LEVEL_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.list_two());
    visit(LOCATION_LEVEL_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameGrid);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
    var page_two = DJANGO_LOCATION_LEVEL_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.list_two());
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    // var sort_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=number,name';
    // xhr(sort_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('number,name', 1));
    var page_two = DJANGO_LOCATION_LEVEL_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 2));
    var sort_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 1));
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL + '?page=2&sort=name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company10');
    });
    // click('.t-sort-number-dir');
    // andThen(() => {
    //     assert.equal(currentURL(),LOCATION_LEVEL_URL + '?sort=number%2Cname');
    //     assert.equal(find('.t-grid-data').length, 10);
    //     assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    // });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name&search=19';
    xhr(search_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.searched('19', 'name'));
    var page_two = DJANGO_LOCATION_LEVEL_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.searched('', 'name', 2));
    var page_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name';
    xhr(page_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.searched('', 'name'));
    var sort_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name&search=9';
    xhr(sort_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.searched('9', 'name'));
    var search_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&search=9';
    xhr(search_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.searched('9', 'id'));
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
    fillIn('.t-grid-search-input', '9');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=9');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company9');
        assert.equal(find('.t-grid-data:eq(1) .t-location-level-name').text(), 'admin.locationlevel.company.tsiname19');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=9&sort=name');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company.tsiname19');
        assert.equal(find('.t-grid-data:eq(1) .t-location-level-name').text(), 'admin.locationlevel.company9');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=&sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?page=2&search=&sort=name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company10');
    });
    fillIn('.t-grid-search-input', '19');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=19&sort=name');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company.tsiname19');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    // var sort_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=number,name';
    // xhr(sort_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('number,name', 1));
    var sort_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 1));
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    // click('.t-sort-number-dir');
    // andThen(() => {
    //     assert.equal(currentURL(),LOCATION_LEVEL_URL + '?sort=number%2Cname');
    //     assert.equal(find('.t-grid-data').length, 10);
    //     assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameGrid);
    // });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=-name';
    xhr(sort_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 1));
    var sort_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 1));
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
        assert.equal(find('.t-reset-grid').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.nameCompany);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?sort=-name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.store');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    // let find_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&number__icontains=num&name__icontains=7';
    // xhr(find_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('number:num,name:7', 1));
    let find_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&name__icontains=tsi';
    xhr(find_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.fulltext('name:tsi', 1));
    visit(LOCATION_LEVEL_URL);
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
    filterGrid('name', 'tsi');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?find=name%3Atsi');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), 'admin.locationlevel.company.tsiname11');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-location-level-name').text(), LOCATION_LEVEL_DEFAULTS.lossPreventionDistrict);
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name', 1));
    visitSync(LOCATION_LEVEL_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-data').length, 8);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL);
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
    visit(LOCATION_LEVEL_URL);
    click('.t-filter-name');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

test('full text searched columns will have a special on css class when active', function(assert) {
    let find_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&name__icontains=';
    xhr(find_two ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.fulltext('name:', 1));
    let find_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&name__icontains=tsi';
    xhr(find_one ,"GET",null,{},200,LOCATION_LEVEL_FIXTURES.fulltext('name:tsi', 1));
    visit(LOCATION_LEVEL_URL);
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
    let option_three = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name&search=9&name__icontains=9';
    xhr(option_three ,'GET',null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name:9', 1));
    let option_two = DJANGO_LOCATION_LEVEL_URL + '/?page=1&ordering=name&search=9';
    xhr(option_two ,'GET',null,{},200,LOCATION_LEVEL_FIXTURES.sorted('name:9', 1));
    let option_one = DJANGO_LOCATION_LEVEL_URL + '/?page=1&search=9';
    xhr(option_one ,'GET',null,{},200,LOCATION_LEVEL_FIXTURES.searched('9', 'id'));
    visit(LOCATION_LEVEL_URL);
    fillIn('.t-grid-search-input', '9');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_NINE);
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=9');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?search=9&sort=name');
    });
    filterGrid('name', '9');
    andThen(() => {
        assert.equal(currentURL(),LOCATION_LEVEL_URL + '?find=name%3A9&search=9&sort=name');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), LOCATION_LEVEL_URL);
    });
    click('.t-filter-name');
    andThen(() => {
        let name_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(name_filter_value, '');
    });
});
