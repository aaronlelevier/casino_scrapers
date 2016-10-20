import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { CATEGORY_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_categories_url;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};

var application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | category-grid-list', {
    beforeEach() {
        
        store = this.application.__container__.lookup('service:simpleStore');
        endpoint = PREFIX + BASE_URL + '/?page=1';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, CF.list());
    },
    afterEach() {
        
    }
});

test('initial load should only show first PAGE_SIZE records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-title').text(), 'Categories');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
        assert.equal(find('.t-grid-data:eq(1) .t-category-description').text().trim(), CD.descriptionRepair);
        assert.equal(find('.t-grid-data:eq(1) .t-category-label').text().trim(), CD.labelOne + '2');
        assert.equal(find('.t-grid-data:eq(1) .t-category-cost_amount').text().trim(), CD.costAmountOne);
        assert.equal(find('.t-grid-data:eq(1) .t-category-cost_code').text().trim(), CD.costCodeOne);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
    visit(CATEGORY_LIST_URL);
    var page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,CF.list_two());
    click('.t-page:eq(1) a');
    andThen(() => {
        const categories = store.find('category-list');
        assert.equal(categories.get('length'), 9);
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-category-name').text().trim()), 'cococat');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        const categories = store.find('category-list');
        assert.equal(categories.get('length'), 10);
        assert.equal(currentURL(),CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
    var page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,CF.list_two());
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=label,name';
    xhr(sort_two ,"GET",null,{},200,CF.sorted('label,name'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
    xhr(page_two ,"GET",null,{},200,CF.sorted_page_two('name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,CF.sorted_page_one('name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), CD.nameOne + '1');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), CD.nameOne + '1');
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2&sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE - 1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-category-name').text().trim()), 'cococat');
    });
    click('.t-sort-label-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=label%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat11');
    });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=label&search=14';
    xhr(search_two ,"GET",null,{},200,CF.searched('14', 'label'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=label';
    xhr(page_two ,"GET",null,{},200,CF.searched('', 'label', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=label';
    xhr(page_one ,"GET",null,{},200,CF.searched('', 'label'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=label&search=4';
    xhr(sort_one ,"GET",null,{},200,CF.searched('4', 'label'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one ,"GET",null,{},200,CF.searched('4', 'name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat14');
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '4');
    });
    click('.t-sort-label-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=4&sort=label');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat14');
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '4');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=&sort=label');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        // assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '10');//firefox
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?page=2&search=&sort=label');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-category-name').text().trim()), CD.nameOne);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=14&sort=label');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat14');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=label,name';
    xhr(sort_two ,"GET",null,{},200,CF.sorted('label,name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,CF.sorted('name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat11');
    });
    click('.t-sort-label-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=label%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        // assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '1');//firefox
    });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=label';
    xhr(sort_four ,"GET",null,{},200,CF.sorted('name,label'));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,label';
    xhr(sort_three ,"GET",null,{},200,CF.sorted('-name,label'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=label,name';
    xhr(sort_two ,"GET",null,{},200,CF.sorted('label,name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,CF.sorted('name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
        assert.ok(find('.t-sort-label-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
        assert.equal(find('.t-reset-grid').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=name');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-label-dir').hasClass('fa-sort'));
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat11');
    });
    click('.t-sort-label-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=label%2Cname');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-label-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        // assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '1');//firefox
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=-name%2Clabel');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-label-dir').hasClass('fa-sort-asc'));
        assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-category-name').text().trim()), 'cococat');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?sort=label');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.ok(find('.t-sort-label-dir').hasClass('fa-sort-asc'));
        assert.ok(!find('.t-sort-name-dir').hasClass('fa-sort-asc'));
        assert.equal(find('.t-grid-data:eq(0) .t-category-name').text().trim(), 'cococat11');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    let find_two = PREFIX + BASE_URL + '/?page=1&label__icontains=hat&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,CF.sorted('label:hat,name:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&label__icontains=hat';
    xhr(find_one ,"GET",null,{},200,CF.fulltext('label:hat', 1));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
    filterGrid('label', 'hat');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?find=label%3Ahat');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-category-name').text().trim()), 'cococat');
    });
    filterGrid('name', '7');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?find=label%3Ahat%2Cname%3A7');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-category-name').text().trim()), 'cococat');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(1) .t-category-name').text().trim(), CD.nameOne + '2');
    });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,"GET",null,{},200,CF.sorted('name'));
    visitSync(CATEGORY_LIST_URL);
    Ember.run.later(function() {
        //categories not bootstrapped anymore
        // assert.equal(find('.t-grid-data').length, 3);
        // assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL);
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
    visit(CATEGORY_LIST_URL);
    click('.t-filter-name');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click('.t-filter-label');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

test('full text searched columns will have a special on css class when active', function(assert) {
    let find_three = PREFIX + BASE_URL + '/?page=1&name__icontains=7';
    xhr(find_three ,"GET",null,{},200,CF.sorted('name:7'));
    let find_two = PREFIX + BASE_URL + '/?page=1&label__icontains=num&name__icontains=7';
    xhr(find_two ,"GET",null,{},200,CF.sorted('label:num,name:7'));
    let find_one = PREFIX + BASE_URL + '/?page=1&label__icontains=num';
    xhr(find_one ,"GET",null,{},200,CF.fulltext('label:num', 1));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.ok(!find('.t-filter-name').hasClass('on'));
        assert.ok(!find('.t-filter-label').hasClass('on'));
    });
    filterGrid('label', 'num');
    andThen(() => {
        assert.ok(!find('.t-filter-name').hasClass('on'));
        assert.ok(find('.t-filter-label').hasClass('on'));
    });
    filterGrid('name', '7');
    andThen(() => {
        assert.ok(find('.t-filter-name').hasClass('on'));
        assert.ok(find('.t-filter-label').hasClass('on'));
    });
    filterGrid('label', '');
    andThen(() => {
        assert.ok(find('.t-filter-name').hasClass('on'));
        assert.ok(!find('.t-filter-label').hasClass('on'));
    });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
    let option_three = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4&name__icontains=4';
    xhr(option_three ,'GET',null,{},200,CF.sorted('name:4'));
    let option_two = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4';
    xhr(option_two ,'GET',null,{},200,CF.sorted('name:4'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,CF.searched('4', 'id'));
    visit(CATEGORY_LIST_URL);
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=4');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=4&sort=name');
    });
    filterGrid('name', '4');
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?find=name%3A4&search=4&sort=name');
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
    });
    click('.t-filter-name');
    andThen(() => {
        let name_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(name_filter_value, '');
    });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,CF.searched('4', 'name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Categories`);
    });
    fillIn('.t-grid-search-input', '4');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=4');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-page-count').text(), '2 Categories');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + '?search=');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Categories`);
    });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
    let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
    const updated_pg_size = PAGE_SIZE*2;
    xhr(option_two, 'GET',null,{},200,CF.paginated(PAGE_SIZE));
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,CF.paginated(updated_pg_size));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,CF.list_two());
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_LIST_URL);
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
        assert.equal(currentURL(), CATEGORY_LIST_URL + '?page=2');
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
        assert.equal(currentURL(),CATEGORY_LIST_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
    alterPageSize('.t-page-size', PAGE_SIZE);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + `?page_size=${PAGE_SIZE}`);
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

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
    clearxhr(list_xhr);
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,CF.paginated(updated_pg_size));
    visit(CATEGORY_LIST_URL + `?page_size=${updated_pg_size}`);
    andThen(() => {
        assert.equal(currentURL(),CATEGORY_LIST_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,CF.sorted('name'));
    visit(CATEGORY_LIST_URL);
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
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,CF.sorted('name'));
//     let name = 'foobar';
//     let routePath = 'admin.categories.index';
//     let url = window.location.toString();
//     let query = '?sort=name';
//     let section = '.t-grid-wrap';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(CATEGORY_LIST_URL);
//     click('.t-sort-name-dir');
//     click('.t-show-save-filterset-modal');
//     xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//     saveFilterSet(name, routePath);
//     andThen(() => {
//         let html = find(section);
//         assert.equal(html.find(navigation).length, 1);
//         let filterset = store.find('filterset', UUID.value);
//         assert.equal(filterset.get('name'), name);
//         assert.equal(filterset.get('endpoint_name'), routePath);
//         assert.equal(filterset.get('endpoint_uri'), query);
//     });
// });

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
    let name = 'foobar';
    let routePath = 'admin.categories.index';
    let query = '?foo=bar';
    let navigation = '.t-filterset-wrap div';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(CATEGORY_LIST_URL);
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
    xhr(sort_one ,'GET',null,{},200,CF.sorted('name'));
    visit(CATEGORY_LIST_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});

test('export csv button shows in grid header', (assert) => {
  visit(CATEGORY_LIST_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}category/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});
