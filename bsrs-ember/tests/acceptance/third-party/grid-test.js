import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
import page from 'bsrs-ember/tests/pages/third-party';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_third_parties_url;
const TP_URL = `${BASE_URL}/index`;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};
const GRID_DATA_0 = '.t-grid-data:eq(0)';
const GRID_DATA_ALL = '.t-grid-data';
const PAGES = '.t-pages';
const PAGE = '.t-page';

var application, store, endpoint, list_xhr, original_uuid;

module('Acceptance | third-party-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_URL}/?page=1`;
        list_xhr = xhr(endpoint ,'GET',null,{},200,TPF.list());
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(TP_URL);
    andThen(() => {
        assert.equal(currentURL(), TP_URL);
        assert.equal(find('.t-grid-title').text(), 'Third Parties');
        assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text(), TPD.nameOne);
        // assert.equal(find(`${GRID_DATA_0} .t-third-party-status`).text(), TPD.roleTypeGeneral);
        // assert.equal(find(`${GRID_DATA_0} .t-role-location_level`).text(), TPD.locationLevelNameOne);
        var pagination = find(`${PAGES}`);
        assert.equal(pagination.find(`${PAGE}`).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        // assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        // assert.ok(!pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
});

// test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
//     var page_two = PREFIX + BASE_URL + '/?page=2';
//     xhr(page_two ,"GET",null,{},200,TPF.list_two());
//     visit(TP_URL);
//     click(`${PAGE}:eq(1) a');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?page=2');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGridXav);
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 2);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.equal(pagination.find(`${PAGE}:eq(1) a').text(), '2');
//         assert.ok(!pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//         assert.ok(pagination.find(`${PAGE}:eq(1) a').hasClass('active'));
//     });
//     click(`${PAGE}:eq(0) a');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 2);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.equal(pagination.find(`${PAGE}:eq(1) a').text(), '2');
//         assert.ok(pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//         assert.ok(!pagination.find(`${PAGE}:eq(1) a').hasClass('active'));
//     });
// });

// test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
//     var page_two = PREFIX + BASE_URL + '/?page=2';
//     xhr(page_two ,"GET",null,{},200,TPF.list_two());
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         isDisabledElement('.t-first');
//         isDisabledElement('.t-previous');
//         isNotDisabledElement('.t-next');
//         isNotDisabledElement('.t-last');
//     });
//     click('.t-next a');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?page=2');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         isNotDisabledElement('.t-first');
//         isNotDisabledElement('.t-previous');
//         isDisabledElement('.t-next');
//         isDisabledElement('.t-last');
//     });
//     click('.t-previous a');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         isDisabledElement('.t-first');
//         isDisabledElement('.t-previous');
//         isNotDisabledElement('.t-next');
//         isNotDisabledElement('.t-last');
//     });
//     click('.t-last a');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?page=2');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         isNotDisabledElement('.t-first');
//         isNotDisabledElement('.t-previous');
//         isDisabledElement('.t-next');
//         isDisabledElement('.t-last');
//     });
//     click('.t-first a');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         isDisabledElement('.t-first');
//         isDisabledElement('.t-previous');
//         isNotDisabledElement('.t-next');
//         isNotDisabledElement('.t-last');
//     });
// });

// test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
//     random.uuid = function() { return UUID.value; };
//     var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
//     xhr(sort_two ,"GET",null,{},200,TPF.sorted('role_type,name'));
//     var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
//     xhr(page_two ,"GET",null,{},200,TPF.sorted('name'));
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,"GET",null,{},200,TPF.sorted('name'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?sort=name');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
//     click(`${PAGE}:eq(1) a');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?page=2&sort=name');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), 'xav18');
//     });
//     click('.t-sort-role-type-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=role_type%2Cname');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
// });

// test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
//     var search_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=14';
//     xhr(search_two ,"GET",null,{},200,TPF.searched('14', 'role_type'));
//     var page_two = PREFIX + BASE_URL + '/?page=2&ordering=role_type';
//     xhr(page_two ,"GET",null,{},200,TPF.searched('', 'role_type', 2));
//     var page_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type';
//     xhr(page_one ,"GET",null,{},200,TPF.searched('', 'role_type'));
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=role_type&search=4';
//     xhr(sort_one ,"GET",null,{},200,TPF.searched('4', 'role_type'));
//     var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
//     xhr(search_one ,"GET",null,{},200,TPF.searched('4', 'id'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
//     fillIn('.t-grid-search-input', '4');
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=4');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 2);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//         assert.equal(find('.t-grid-data:eq(1) .t-role-name').text(), TPD.nameGridXav);
//     });
//     click('.t-sort-role-type-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=4&sort=role_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 2);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//         assert.equal(find('.t-grid-data:eq(1) .t-role-name').text(), TPD.nameGridXav);
//     });
//     fillIn('.t-grid-search-input', '');
//     triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=&sort=role_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         // assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGridTen); //admin instead?
//     });
//     click(`${PAGE}:eq(1) a');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?page=2&search=&sort=role_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         // assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGridXav); //12?
//     });
//     fillIn('.t-grid-search-input', '14');
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=14&sort=role_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 1);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGridXav);
//     });
//     click('.t-reset-grid');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
// });

// test('multiple sort options appear in the query string as expected', function(assert) {
//     random.uuid = function() { return UUID.value; };
//     var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
//     xhr(sort_two ,"GET",null,{},200,TPF.sorted('role_type,name'));
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,"GET",null,{},200,TPF.sorted('name'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=name');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);

//     });
//     click('.t-sort-role-type-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=role_type%2Cname');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
// });

// test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
//     random.uuid = function() { return UUID.value; };
//     var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=name,role_type';
//     xhr(sort_four ,"GET",null,{},200,TPF.sorted('name,role_type'));
//     var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,role_type';
//     xhr(sort_three ,"GET",null,{},200,TPF.sorted('-name,role_type'));
//     var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=role_type,name';
//     xhr(sort_two ,"GET",null,{},200,TPF.sorted('role_type,name'));
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,"GET",null,{},200,TPF.sorted('name'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
//         assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//         assert.equal(find('.t-reset-grid').length, 0);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=name');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort'));
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
//     click('.t-sort-role-type-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=role_type%2Cname');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=-name%2Crole_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), 'zap9');
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?sort=name%2Crole_type');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.ok(find('.t-sort-role-type-dir').hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameTwo);
//     });
//     click('.t-reset-grid');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
// });

// test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
//     let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i&name__icontains=xav';
//     xhr(find_two ,"GET",null,{},200,TPF.sorted('role_type:i,name:xav'));
//     let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=i';
//     xhr(find_one ,"GET",null,{},200,TPF.fulltext('role_type:i', 1));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
//     filterGrid('role_type', 'i');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?find=role_type%3Ai');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
//     filterGrid('name', 'xav');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?find=role_type%3Ai%2Cname%3Axav');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), 'xav11');
//     });
//     click('.t-reset-grid');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${GRID_DATA_0} .t-role-name').text(), TPD.nameGrid);
//     });
// });

// test('loading screen shown before any xhr and hidden after', function(assert) {
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,"GET",null,{},200,TPF.sorted('name'));
//     visitSync(TP_URL);
//     Ember.run.later(function() {
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 3);
//         assert.equal(find('.t-grid-loading-graphic').length, 1);
//     }, 0);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find('.t-grid-loading-graphic').length, 0);
//     });
//     click('.t-sort-name-dir');
//     Ember.run.later(function() {
//         assert.equal(find('.t-grid-loading-graphic').length, 1);
//     }, 0);
//     andThen(() => {
//         assert.equal(find('.t-grid-loading-graphic').length, 0);
//     });
// });

// test('when a full text filter is selected the input inside the modal is focused', function(assert) {
//     visit(TP_URL);
//     click('.t-filter-name');
//     andThen(() => {
//         isFocused('.ember-modal-dialog input:first');
//     });
//     click('.t-filter-role-type');
//     andThen(() => {
//         isFocused('.ember-modal-dialog input:first');
//     });
// });

// test('full text searched columns will have a special on css class when active', function(assert) {
//     let find_three = PREFIX + BASE_URL + '/?page=1&role_type__icontains=&name__icontains=7';
//     xhr(find_three ,"GET",null,{},200,TPF.sorted('name:7'));
//     let find_two = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in&name__icontains=7';
//     xhr(find_two ,"GET",null,{},200,TPF.sorted('role_type:in,name:7'));
//     let find_one = PREFIX + BASE_URL + '/?page=1&role_type__icontains=in';
//     xhr(find_one ,"GET",null,{},200,TPF.fulltext('role_type:in', 1));
//     visit(TP_URL);
//     andThen(() => {
//         assert.ok(!find('.t-filter-name').hasClass('on'));
//         assert.ok(!find('.t-filter-role-type').hasClass('on'));
//     });
//     filterGrid('role_type', 'in');
//     andThen(() => {
//         assert.ok(!find('.t-filter-name').hasClass('on'));
//         assert.ok(find('.t-filter-role-type').hasClass('on'));
//     });
//     filterGrid('name', '7');
//     andThen(() => {
//         assert.ok(find('.t-filter-name').hasClass('on'));
//         assert.ok(find('.t-filter-role-type').hasClass('on'));
//     });
//     filterGrid('role_type', '');
//     andThen(() => {
//         assert.ok(find('.t-filter-name').hasClass('on'));
//         assert.ok(!find('.t-filter-role-type').hasClass('on'));
//     });
// });

// test('after you reset the grid the filter model will also be reset', function(assert) {
//     let option_three = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4&name__icontains=4';
//     xhr(option_three ,'GET',null,{},200,TPF.sorted('name:4'));
//     let option_two = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4';
//     xhr(option_two ,'GET',null,{},200,TPF.sorted('name:4'));
//     let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
//     xhr(option_one ,'GET',null,{},200,TPF.searched('4', 'id'));
//     visit(TP_URL);
//     fillIn('.t-grid-search-input', '4');
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=4');
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=4&sort=name');
//     });
//     filterGrid('name', '4');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?find=name%3A4&search=4&sort=name');
//     });
//     click('.t-reset-grid');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//     });
//     click('.t-filter-name');
//     andThen(() => {
//         let name_filter_value = $('.ember-modal-dialog input:first').val();
//         assert.equal(name_filter_value, '');
//     });
// });

// test('count is shown and updated as the user filters down the list from django', function(assert) {
//     let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
//     xhr(option_one ,'GET',null,{},200,TPF.searched('4', 'id'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${PAGE}-count').text(), '19 Roles');
//     });
//     fillIn('.t-grid-search-input', '4');
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=4');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 2);
//         assert.equal(find(`${PAGE}-count').text(), '2 Roles');
//     });
//     fillIn('.t-grid-search-input', '');
//     triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?search=');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${PAGE}-count').text(), '19 Roles');
//     });
// });

// test('picking a different number of pages will alter the query string and xhr', function(assert) {
//     let option_two = PREFIX + BASE_URL + '/?page=1&page_size=10';
//     xhr(option_two, 'GET',null,{},200,TPF.paginated(10));
//     let option_one = PREFIX + BASE_URL + '/?page=1&page_size=25';
//     xhr(option_one, 'GET',null,{},200,TPF.paginated(25));
//     let page_two = PREFIX + BASE_URL + '/?page=2';
//     xhr(page_two, 'GET',null,{},200,TPF.list_two());
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL);
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${PAGE}-size option:selected').text(), '10 per page');
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 2);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.equal(pagination.find(`${PAGE}:eq(1) a').text(), '2');
//         assert.ok(pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//         assert.ok(!pagination.find(`${PAGE}:eq(1) a').hasClass('active'));
//     });
//     click(`${PAGE}:eq(1) a');
//     andThen(() => {
//         assert.equal(currentURL(), TP_URL + '?page=2');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 9);
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 2);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.equal(pagination.find(`${PAGE}:eq(1) a').text(), '2');
//         assert.ok(!pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//         assert.ok(pagination.find(`${PAGE}:eq(1) a').hasClass('active'));
//     });
//     alterPageSize(`${PAGE}-size', 25);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?page_size=25');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 19);
//         assert.equal(find(`${PAGE}-size option:selected').text(), '25 per page');
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 1);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.ok(pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//     });
//     alterPageSize(`${PAGE}-size', 10);
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?page_size=10');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 10);
//         assert.equal(find(`${PAGE}-size option:selected').text(), '10 per page');
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 2);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.equal(pagination.find(`${PAGE}:eq(1) a').text(), '2');
//         assert.ok(pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//         assert.ok(!pagination.find(`${PAGE}:eq(1) a').hasClass('active'));
//     });
// });

// test('starting with a page size greater than 10 will set the selected', function(assert) {
//     clearxhr(list_xhr);
//     let option_one = PREFIX + BASE_URL + '/?page=1&page_size=25';
//     xhr(option_one, 'GET',null,{},200,TPF.paginated(25));
//     visit(TP_URL + '?page_size=25');
//     andThen(() => {
//         assert.equal(currentURL(),TP_URL + '?page_size=25');
//         assert.equal(find(`${GRID_DATA_ALL}`).length, 19);
//         assert.equal(find(`${PAGE}-size option:selected').text(), '25 per page');
//         var pagination = find(`${PAGES}`);
//         assert.equal(pagination.find(`${PAGE}').length, 1);
//         assert.equal(pagination.find(`${PAGE}:eq(0) a').text(), '1');
//         assert.ok(pagination.find(`${PAGE}:eq(0) a').hasClass('active'));
//     });
// });

// test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
//     visit(TP_URL);
//     click('.t-sort-name-dir');
//     click('.t-show-save-filterset-modal');
//     andThen(() => {
//         isFocused('.ember-modal-dialog input:first');
//     });
//     click('.t-grid-search-input');
//     andThen(() => {
//         isNotFocused('.ember-modal-dialog input:first');
//     });
// });

// test('save filterset will fire off xhr and add item to the sidebar navigation', function(assert) {
//     random.uuid = function() { return UUID.value; };
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
//     let name = 'foobar';
//     let routePath = 'admin.roles.index';
//     let url = window.location.toString();
//     let query = url.slice(url.indexOf('?'));
//     let section = '.t-grid-wrap';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(TP_URL);
//     click('.t-sort-name-dir');
//     click('.t-show-save-filterset-modal');
//     xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//     saveFilterSet(name, routePath);
//     andThen(() => {
//         let html = find(section);
//         assert.equal(html.find(navigation).length, 2);
//         let filterset = store.find('filterset', UUID.value);
//         assert.equal(filterset.get('name'), name);
//         assert.equal(filterset.get('endpoint_name'), routePath);
//         assert.equal(filterset.get('endpoint_uri'), query);
//     });
// });

// test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
//     let name = 'foobar';
//     let routePath = 'admin.roles.index';
//     let query = '?foo=bar';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(TP_URL);
//     clearAll(store, 'filterset');
//     andThen(() => {
//         store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
//     });
//     andThen(() => {
//         let section = find('.t-grid-wrap');
//         assert.equal(section.find(navigation).length, 1);
//     });
//     xhr('/api/admin/saved-searches/' + UUID.value + '/', 'DELETE', null, {}, 204, {});
//     click(navigation + '> a > .t-remove-filterset:eq(0)');
//     andThen(() => {
//         let section = find('.t-grid-wrap');
//         assert.equal(section.find(navigation).length, 0);
//     });
// });

// test('save filterset button only available when a dynamic filter is present', function(assert) {
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
//     visit(TP_URL);
//     andThen(() => {
//         assert.equal(find('.t-show-save-filterset-modal').length, 0);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(find('.t-show-save-filterset-modal').length, 1);
//     });
// });

