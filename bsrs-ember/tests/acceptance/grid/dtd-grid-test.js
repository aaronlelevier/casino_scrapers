import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import DTDF from 'bsrs-ember/vendor/dtd_fixtures';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import random from 'bsrs-ember/models/random';
// import timemachine from 'vendor/timemachine';
// import moment from 'moment';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_dtd_url;
const DTD_URL = `${BASE_URL}/index`;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const NUMBER_FIVE = {keyCode: 53};
const BACKSPACE = {keyCode: 8};
const SORT_KEY_DIR = '.t-sort-key-dir';
// const SORT_PRIORITY_DIR = '.t-sort-priority-translated-name-dir';

var application, store, endpoint, list_xhr, original_uuid;

module('Acceptance | dtd grid test', {
    beforeEach() {
        // timemachine.config({
        //     dateString: 'December 25, 2014 13:12:59'
        // });
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = `${PREFIX}${BASE_URL}/?page=1`;
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, DTDF.list());
        original_uuid = random.uuid;
    },
    afterEach() {
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
        // timemachine.reset();
    }
});

test('initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        assert.equal(find('.t-grid-title').text(), 'Decision Tree Definitions');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-description').text().trim(), DTD.descriptionOne);
        // assert.ok(find('.t-grid-data:eq(0) .t-dtd-priority-emergency'));
        // assert.ok(find('.t-grid-data:eq(0) .t-dtd-status-new'));
        // const time = moment(new Date()).calendar();
        // assert.equal(find('.t-grid-data:eq(0) .t-dtd-created').text().trim(), `${time}`);
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
    xhr(page_two ,"GET",null,{},200,DTDF.list_two());
    visit(DTD_URL);
    click('.t-page:eq(1) a');
    andThen(() => {
        const dtds_all = store.find('dtd-list');
        assert.equal(dtds_all.get('length'), 9);
        assert.equal(currentURL(), DTD_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
    click('.t-page:eq(0) a');
    andThen(() => {
        const dtds_all = store.find('dtd-list');
        assert.equal(dtds_all.get('length'), 10);
        assert.equal(currentURL(),DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 2);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
        assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
    });
});

test('clicking first,last,next and previous will key page 1 and 2 correctly', function(assert) {
    var page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,DTDF.list_two());
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL + '?page=2');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
        isNotDisabledElement('.t-first');
        isNotDisabledElement('.t-previous');
        isDisabledElement('.t-next');
        isDisabledElement('.t-last');
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        isDisabledElement('.t-first');
        isDisabledElement('.t-previous');
        isNotDisabledElement('.t-next');
        isNotDisabledElement('.t-last');
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    // var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=key,priority__name';
    // xhr(sort_two ,"GET",null,{},200,DTDF.sorted('key,priority'));
    // var page_two = PREFIX + BASE_URL + '/?page=2&ordering=priority__name';
    // xhr(page_two ,"GET",null,{},200,DTDF.sorted_page_two('priority'));
    // var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=priority__name';
    // xhr(sort_one ,"GET",null,{},200,DTDF.sorted('priority'));
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
    });
    // click(SORT_PRIORITY_DIR);
    // andThen(() => {
    //     assert.equal(currentURL(), DTD_URL + '?sort=priority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
    // });
    // click('.t-page:eq(1) a');
    // andThen(() => {
    //     assert.equal(currentURL(), DTD_URL + '?page=2&sort=priority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    //     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
    // });
    // click('.t-sort-key-dir');
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=key%2Cpriority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
    // });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=key&search=14';
    xhr(search_two ,"GET",null,{},200,DTDF.searched('14', 'key'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=key';
    xhr(page_two ,"GET",null,{},200,DTDF.sorted_page_two('key'));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
    xhr(page_one ,"GET",null,{},200,DTDF.sorted_page_one('key'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key&search=5';
    xhr(sort_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=5';
    xhr(search_one ,"GET",null,{},200,DTDF.searched('5', 'key'));
    visit(DTD_URL);
    fillIn('.t-grid-search-input', '5');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FIVE);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=5');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearchFiveOne);
        assert.equal(find('.t-grid-data:eq(1) .t-dtd-key').text().trim(), DTD.keySearchFiveTwo);
    });
    click('.t-sort-key-dir');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=5&sort=key');
        assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearchFiveOne);
        assert.equal(find('.t-grid-data:eq(1) .t-dtd-key').text().trim(), DTD.keySearchFiveTwo);
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=&sort=key');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    click('.t-page:eq(1) a');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?page=2&search=&sort=key');
        assert.equal(find('.t-grid-data').length, 9);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyTwo);
    });
    fillIn('.t-grid-search-input', '14');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_ONE);
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=14&sort=key');
        assert.equal(find('.t-grid-data').length, 1);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keySearch14);
    });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
});

test('multiple sort options appear in the query string as expected', function(assert) {
    // var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=key,priority__name';
    // xhr(sort_two ,"GET",null,{},200,DTDF.sorted('key,priority'));
    // var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=priority__name';
    // xhr(sort_one ,"GET",null,{},200,DTDF.sorted('priority'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=description,key';
    xhr(sort_two ,"GET",null,{},200,DTDF.sorted_page_one('priority'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
    xhr(sort_one ,"GET",null,{},200,DTDF.sorted_page_one('priority'));
    visit(DTD_URL);
    click('.t-sort-key-dir');
    andThen(() => {
        assert.equal(currentURL(), `${DTD_URL}?sort=key`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    click('.t-sort-description-dir');
    andThen(() => {
        assert.equal(currentURL(), `${DTD_URL}?sort=description%2Ckey`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    // click(SORT_PRIORITY_DIR);
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=priority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyLastGrid);
    // });
    // click('.t-sort-key-dir');
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=key%2Cpriority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
    // });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
    // var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=key';
    // xhr(sort_four ,"GET",null,{},200,DTDF.sorted('priority,key'));
    // var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-priority__name,key';
    // xhr(sort_three ,"GET",null,{},200,DTDF.sorted('-priority,key'));
    // var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=key,priority__name';
    // xhr(sort_two ,"GET",null,{},200,DTDF.sorted('key,priority'));
    // var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=priority__name';
    // xhr(sort_one ,"GET",null,{},200,DTDF.sorted('priority'));
    var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-key,description';
    xhr(sort_three ,"GET",null,{},200,DTDF.sorted_page_one('priority'));
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=description,key';
    xhr(sort_two ,"GET",null,{},200,DTDF.sorted_page_one('priority'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
    xhr(sort_one ,"GET",null,{},200,DTDF.sorted_page_one('priority'));
    visit(DTD_URL);
    click('.t-sort-key-dir');
    andThen(() => {
        assert.equal(currentURL(), `${DTD_URL}?sort=key`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    click('.t-sort-description-dir');
    andThen(() => {
        assert.equal(currentURL(), `${DTD_URL}?sort=description%2Ckey`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    click('.t-sort-key-dir');
    andThen(() => {
        assert.equal(currentURL(), `${DTD_URL}?sort=-key%2Cdescription`);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
    // click(SORT_PRIORITY_DIR);
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=priority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
    //     assert.ok(find('.t-sort-key-dir').hasClass('fa-sort'));
    //     // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), 'sub13');
    // });
    // click('.t-sort-key-dir');
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=key%2Cpriority.translated_name');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.ok(find('.t-sort-key-dir').hasClass('fa-sort-asc'));
    //     assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyLastGrid);
    // });
    // click(SORT_PRIORITY_DIR);
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=-priority.translated_name%2Ckey');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.ok(find('.t-sort-key-dir').hasClass('fa-sort-asc'));
    //     assert.ok(find(SORT_PRIORITY_DIR).hasClass('fa-sort-desc'));
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyLastGrid);
    // });
    // click(SORT_PRIORITY_DIR);
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?sort=key');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.ok(find('.t-sort-key-dir').hasClass('fa-sort-asc'));
    //     assert.ok(!find(SORT_PRIORITY_DIR).hasClass('fa-sort-asc'));
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyLastGrid);
    // });
    click('.t-reset-grid');
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
    // let find_three = PREFIX + BASE_URL + '/?page=1&priority__name__icontains=h';
    // xhr(find_three, "GET",null,{},200,DTDF.sorted('id'));
    let find_one = `${PREFIX}${BASE_URL}/?page=1&key__icontains=13`;
    xhr(find_one ,"GET",null,{},200,DTDF.fulltext('key:13', 1));
    visit(DTD_URL);
    filterGrid('key', '13');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?find=key%3A13');
        // assert.equal(find('.t-grid-data').length, 1);
        // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyFullText);
    });
    filterGrid('key', '');
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?find=');
        // assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        // assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOneGrid);
    });
    // filterGrid('priority.translated_name', 'h');
    // andThen(() => {
    //     assert.equal(currentURL(),DTD_URL + '?find=priority.translated_name%3Ah');
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyLastGrid);
    // });
    // click('.t-reset-grid');
    // andThen(() => {
    //     assert.equal(currentURL(), DTD_URL);
    //     assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    //     assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOne);
    // });
});

// test('loading screen shown before any xhr and hidden after', function(assert) {
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=priority__name';
//     xhr(sort_one ,"GET",null,{},200,DTDF.sorted('priority'));
//     visitSync(DTD_URL);
//     Ember.run.later(function() {
//         assert.equal(find('.t-grid-data').length, 0);
//         // assert.equal(find('.t-grid-loading-graphic').length, 1);
//     }, 0);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL);
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//         assert.equal(find('.t-grid-loading-graphic').length, 0);
//     });
//     click(SORT_PRIORITY_DIR);
//     Ember.run.later(function() {
//         // assert.equal(find('.t-grid-loading-graphic').length, 1);
//     }, 0);
//     andThen(() => {
//         assert.equal(find('.t-grid-loading-graphic').length, 0);
//     });
// });

// test('when a full text filter is selected the input inside the modal is focused', function(assert) {
//     visit(DTD_URL);
//     click(FILTER_PRIORITY);
//     andThen(() => {
//         isFocused('.ember-modal-dialog input:first');
//     });
//     click('.t-filter-key');
//     andThen(() => {
//         isFocused('.ember-modal-dialog input:first');
//     });
// });

// test('full text searched columns will have a special on css class when active', function(assert) {
//     let find_three = PREFIX + BASE_URL + '/?page=1&priority__name__icontains=7';
//     xhr(find_three ,"GET",null,{},200,DTDF.sorted('priority:7'));
//     let find_two = PREFIX + BASE_URL + '/?page=1&key__icontains=num&priority__name__icontains=7';
//     xhr(find_two ,"GET",null,{},200,DTDF.sorted('key:num,priority:7'));
//     let find_one = PREFIX + BASE_URL + '/?page=1&key__icontains=num';
//     xhr(find_one ,"GET",null,{},200,DTDF.fulltext('key:num', 1));
//     visit(DTD_URL);
//     andThen(() => {
//         assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
//         assert.ok(!find('.t-filter-key').hasClass('on'));
//     });
//     filterGrid('key', 'num');
//     andThen(() => {
//         assert.ok(!find(FILTER_PRIORITY).hasClass('on'));
//         assert.ok(find('.t-filter-key').hasClass('on'));
//     });
//     filterGrid('priority.translated_name', '7');
//     andThen(() => {
//         assert.ok(find(FILTER_PRIORITY).hasClass('on'));
//         assert.ok(find('.t-filter-key').hasClass('on'));
//     });
//     filterGrid('key', '');
//     andThen(() => {
//         assert.ok(find(FILTER_PRIORITY).hasClass('on'));
//         assert.ok(!find('.t-filter-key').hasClass('on'));
//     });
// });

// test('after you reset the grid the filter model will also be reset', function(assert) {
//     let option_three = PREFIX + BASE_URL + '/?page=1&ordering=priority__name&search=4&priority__name__icontains=4';
//     xhr(option_three ,'GET',null,{},200,DTDF.sorted('priority:4'));
//     let option_two = PREFIX + BASE_URL + '/?page=1&ordering=priority__name&search=4';
//     xhr(option_two ,'GET',null,{},200,DTDF.sorted('priority:4'));
//     let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
//     xhr(option_one ,'GET',null,{},200,DTDF.searched('4', 'id'));
//     visit(DTD_URL);
//     fillIn('.t-grid-search-input', '4');
//     triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=4');
//     });
//     click(SORT_PRIORITY_DIR);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=4&sort=priority.translated_name');
//     });
//     filterGrid('priority.translated_name', '4');
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?find=priority.translated_name%3A4&search=4&sort=priority.translated_name');
//     });
//     click('.t-reset-grid');
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//     });
//     click(FILTER_PRIORITY);
//     andThen(() => {
//         let priority_filter_value = $('.ember-modal-dialog input:first').val();
//         assert.equal(priority_filter_value, '');
//     });
// });

test('count is shown and updated as the user filters down the list from django', function(assert) {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=6';
    xhr(option_one ,'GET',null,{},200,DTDF.searched('6', 'key'));
    visit(DTD_URL);
    andThen(() => {
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Decision Tree Definitions`);
    });
    fillIn('.t-grid-search-input', '6');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=6');
        // assert.equal(find('.t-grid-data').length, 2);
        assert.equal(find('.t-page-count').text(), '2 Decision Tree Definitions');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + '?search=');
        assert.equal(find('.t-grid-data').length, PAGE_SIZE);
        assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-1} Decision Tree Definitions`);
    });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
    let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
    xhr(option_two, 'GET',null,{},200,DTDF.paginated(PAGE_SIZE));
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,DTDF.paginated(updated_pg_size));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,DTDF.list_two());
    visit(DTD_URL);
    andThen(() => {
        assert.equal(currentURL(), DTD_URL);
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
        assert.equal(currentURL(), DTD_URL + '?page=2');
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
        assert.equal(currentURL(),DTD_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
    alterPageSize('.t-page-size', PAGE_SIZE);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + `?page_size=${PAGE_SIZE}`);
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
    xhr(option_one, 'GET',null,{},200,DTDF.paginated(updated_pg_size));
    visit(DTD_URL + `?page_size=${updated_pg_size}`);
    andThen(() => {
        assert.equal(currentURL(),DTD_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find('.t-grid-data').length, updated_pg_size-1);
        assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('.t-page').length, 1);
        assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
        assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
    xhr(sort_one ,'GET',null,{},200,DTDF.sorted('key'));
    visit(DTD_URL);
    click(SORT_KEY_DIR);
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
    xhr(sort_one ,'GET',null,{},200,DTDF.sorted_page_one('key'));
    let name = '3';
    let routePath = 'admin.dtds.index';
    let url = window.location.toString();
    let query = '?sort=key';
    let section = '.t-grid-wrap';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(DTD_URL);
    click(SORT_KEY_DIR);
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
    let name = '3';
    let routePath = 'admin.dtds.index';
    let query = '?key=3';
    let navigation = '.t-filterset-wrap li';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(DTD_URL);
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
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=key';
    xhr(sort_one ,'GET',null,{},200,DTDF.sorted('key'));
    visit(DTD_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click(SORT_KEY_DIR);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});

// test('status.translated_name is a functional related filter', function(assert) {
//     let option_four = PREFIX + BASE_URL + '/?page=1&ordering=-status__name&status__name__icontains=rr';
//     xhr(option_four,'GET',null,{},200,DTDF.searched_related(DTD.statusTwoId, 'status'));
//     let option_three = PREFIX + BASE_URL + '/?page=1&ordering=-status__name';
//     xhr(option_three,'GET',null,{},200,DTDF.searched_related(DTD.statusTwoId, 'status'));
//     let option_two = PREFIX + BASE_URL + '/?page=1&ordering=status__name';
//     xhr(option_two,'GET',null,{},200,DTDF.searched_related(DTD.statusTwoId, 'status'));
//     let option_one = PREFIX + BASE_URL + '/?page=1&search=r';
//     xhr(option_one,'GET',null,{},200,DTDF.searched_related(DTD.statusTwoId, 'status'));
//     visit(DTD_URL);
//     andThen(() => {
//         assert.equal(currentURL(), DTD_URL);
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusOneKey));
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOneGrid);
//     });
//     fillIn('.t-grid-search-input', 'r');
//     triggerEvent('.t-grid-search-input', 'keyup', LETTER_R);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=r');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusTwoKey));
//         assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
//     });
//     fillIn('.t-grid-search-input', '');
//     triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=');
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusOneKey));
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-key').text().trim(), DTD.keyOneGrid);
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE);
//     });
//     click(SORT_STATUS_DIR);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=&sort=status.translated_name');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusTwoKey));
//         assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
//     });
//     click(SORT_STATUS_DIR);
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?search=&sort=-status.translated_name');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//         // assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusOneKey));
//         assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
//     });
//     filterGrid('status.translated_name', 'rr');
//     andThen(() => {
//         assert.equal(currentURL(),DTD_URL + '?find=status.translated_name%3Arr&search=&sort=-status.translated_name');
//         assert.equal(find('.t-grid-data').length, PAGE_SIZE-1);
//         assert.equal(find('.t-grid-data:eq(0) .t-dtd-status-translated_name').text().trim(), t(DTD.statusTwoKey));
//         assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-dtd-key').text().trim()), 'ape');
//     });
// });





