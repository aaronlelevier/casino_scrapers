import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_roles_url;
const ROLE_URL = BASE_URL + '/index';
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

module('Acceptance | role-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint ,'GET',null,{},200,ROLE_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-title').text(), 'Roles');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
        assert.equal(find('.t-grid-data:eq(0) .t-role-role_type').text(), ROLE_DEFAULTS.roleTypeGeneral);
        assert.equal(find('.t-grid-data:eq(0) .t-role-location_level').text(), ROLE_DEFAULTS.locationLevelNameOne);
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
    xhr(page_two ,"GET",null,{},200,ROLE_FIXTURES.list_two());
    visit(ROLE_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGridXav);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
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
    xhr(page_two ,"GET",null,{},200,ROLE_FIXTURES.list_two());
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, 9);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
    xhr(sort_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('role_type,name', 1));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('name', 2));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,ROLE_FIXTURES.sorted('name', 1));
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameTwo);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL + '?page=2&sort=name');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), 'xav18');
    });
    click('.t-sort-role-type-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=role_type%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameOne);
    });
});

test('typing a search will reset page to 1 and require an additional xhr', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=14';
    xhr(search_two ,"GET",null,{},200,ROLE_FIXTURES.searched('14', 'role_type'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=role_type';
    xhr(page_two ,"GET",null,{},200,ROLE_FIXTURES.searched('', 'role_type', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type';
    xhr(page_one ,"GET",null,{},200,ROLE_FIXTURES.searched('', 'role_type'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=4';
    xhr(sort_one ,"GET",null,{},200,ROLE_FIXTURES.searched('4', 'role_type'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,ROLE_FIXTURES.searched('4', 'id'));
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-role-name').text(), ROLE_DEFAULTS.nameGridXav);
    });
    click('.t-sort-role-type-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?search=4&sort=role_type');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
        assert.equal(find('.t-grid-data:eq(1) .t-role-name').text(), ROLE_DEFAULTS.nameGridXav);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?search=&sort=role_type');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGridTen);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?page=2&search=&sort=role_type');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGridXav);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?search=14&sort=role_type');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGridXav);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
    xhr(sort_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('role_type,name', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,ROLE_FIXTURES.sorted('name', 1));
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameTwo);
    });
    click('.t-sort-role-type-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=role_type%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameOne);
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=name,role_type';
    xhr(sort_four ,"GET",null,{},200,ROLE_FIXTURES.sorted('name,role_type', 1));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,role_type';
    xhr(sort_three ,"GET",null,{},200,ROLE_FIXTURES.sorted('-name,role_type', 1));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
    xhr(sort_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('role_type,name', 1));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,ROLE_FIXTURES.sorted('name', 1));
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
        assert.equal(find('.t-reset-sort-order').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameTwo);
    });
    click('.t-sort-role-type-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=role_type%2Cname');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameOne);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=-name%2Crole_type');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), 'zap9');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?sort=name%2Crole_type');
        assert.equal(find('.t-grid-data').length, 10);
        assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameTwo);
    });
    click('.t-reset-sort-order');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
});

test('full text search will filter down the result set and query django accordingly', function(assert) {
    let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i&name__icontains=xav';
    xhr(find_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('role_type:i,name:xav', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i';
    xhr(find_one ,"GET",null,{},200,ROLE_FIXTURES.fulltext('role_type:i', 1));
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
    filterGrid('role_type', 'i');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?find=role_type%3Ai');
        assert.equal(find('.t-grid-data').length, 10);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), ROLE_DEFAULTS.nameGrid);
    });
    filterGrid('name', 'xav');
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL + '?find=role_type%3Ai%2Cname%3Axav');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-role-name').text(), 'xav11');
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,ROLE_FIXTURES.sorted('name', 1));
    visitSync(ROLE_URL);
    Ember.run.later(function() {
        assert.equal(find('.t-grid-data').length, 3);
        assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL);
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
    visit(ROLE_URL);
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
    let find_three = PREFIX + BASE_URL + '/?page=1&role_type__icontains=&name__icontains=7';
    xhr(find_three ,"GET",null,{},200,ROLE_FIXTURES.sorted('name:7', 1));
    let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,ROLE_FIXTURES.sorted('role_type:in,name:7', 1));
    let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in';
    xhr(find_one ,"GET",null,{},200,ROLE_FIXTURES.fulltext('role_type:in', 1));
    visit(ROLE_URL);
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
