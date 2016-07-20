import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import TPF from 'bsrs-ember/vendor/third_party_fixtures';
import TPD from 'bsrs-ember/vendor/defaults/third-party';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { THIRD_PARTY_LIST_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import page from 'bsrs-ember/tests/pages/third-party';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_third_parties_url;
const NUMBER_ONE = {keyCode: 49};
const NUMBER_FOUR = {keyCode: 52};
const BACKSPACE = {keyCode: 8};
const GRID_DATA_0 = '.t-grid-data:eq(0)';
const GRID_DATA_1 = '.t-grid-data:eq(1)';
const GRID_DATA_2 = '.t-grid-data:eq(2)';
const GRID_DATA_ALL = '.t-grid-data';
const PAGES = '.t-pages';
const PAGE = '.t-page';
const FIRST_LINK = '.t-first';
const RESET_GRID = '.t-reset-grid';
const LAST_LINK = '.t-last';
const NEXT_LINK = '.t-next';
const PREVIOUS_LINK = '.t-previous';
const SEARCH_INPUT = '.t-grid-search-input';
const SORT_DIR = '.t-sort-status-name-dir';
const STATUS_FILTER = '.t-filter-status-name';

var application, store, endpoint, list_xhr;

moduleForAcceptance('Acceptance | third-party-grid-list', {
    beforeEach() {
        
        store = this.application.__container__.lookup('service:simpleStore');
        endpoint = `${PREFIX}${BASE_URL}/?page=1`;
        list_xhr = xhr(endpoint ,'GET',null,{},200,TPF.list());
    },
    afterEach() {
        
    }
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, (assert) => {
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find('.t-grid-title').text(), t('admin.third_party'));
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
        // assert.equal(find(`${GRID_DATA_0} .t-status`).text().trim(), TPD.third-partyTypeGeneral);
        // assert.equal(find(`${GRID_DATA_0} .t-third-party-location_level`).text().trim(), TPD.locationLevelNameOne);
        var pagination = find(`${PAGES}`);
        assert.equal(pagination.find(`${PAGE}`).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(!pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', (assert) => {
    ajax(`${PREFIX}${BASE_URL}/?page=2` ,'GET',null,{},200,TPF.list_two());
    visit(THIRD_PARTY_LIST_URL);
    click(`${PAGE}:eq(1) a`);
    andThen(() => {
        const third_parties = store.find('third-party-list');
        assert.equal(third_parties.get('length'), 9);
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?page=2');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE-1);
        assert.equal(substring_up_to_num(find(`${GRID_DATA_0} .t-third-party-name`).text().trim()), 'vzoname');
        var pagination = find(`${PAGES}`);
        assert.equal(pagination.find(`${PAGE}`).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(!pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
    click(`${PAGE}:eq(0) a`);
    andThen(() => {
        const third_parties = store.find('third-party-list');
        assert.equal(third_parties.get('length'), 11);
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
        var pagination = find(`${PAGES}`);
        assert.equal(pagination.find(`${PAGE}`).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(!pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', (assert) => {
    ajax(`${PREFIX}${BASE_URL}/?page=2` ,'GET',null,{},200,TPF.list_two());
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        isDisabledElement(`${FIRST_LINK}`);
        isDisabledElement(`${PREVIOUS_LINK}`);
        isNotDisabledElement(`${NEXT_LINK}`);
        isNotDisabledElement(`${LAST_LINK}`);
    });
    click('.t-next a');
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?page=2');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE-1);
        isNotDisabledElement(`${FIRST_LINK}`);
        isNotDisabledElement(`${PREVIOUS_LINK}`);
        isDisabledElement(`${NEXT_LINK}`);
        isDisabledElement(`${LAST_LINK}`);
    });
    click('.t-previous a');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        isDisabledElement(`${FIRST_LINK}`);
        isDisabledElement(`${PREVIOUS_LINK}`);
        isNotDisabledElement(`${NEXT_LINK}`);
        isNotDisabledElement(`${LAST_LINK}`);
    });
    click('.t-last a');
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?page=2');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE-1);
        isNotDisabledElement(`${FIRST_LINK}`);
        isNotDisabledElement(`${PREVIOUS_LINK}`);
        isDisabledElement(`${NEXT_LINK}`);
        isDisabledElement(`${LAST_LINK}`);
    });
    click('.t-first a');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        isDisabledElement(`${FIRST_LINK}`);
        isDisabledElement(`${PREVIOUS_LINK}`);
        isNotDisabledElement(`${NEXT_LINK}`);
        isNotDisabledElement(`${LAST_LINK}`);
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', (assert) => {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=-name';
    xhr(sort_two ,'GET',null,{},200,TPF.sorted('status,name'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=name';
    xhr(page_two ,'GET',null,{},200,TPF.sorted_page_two('name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?sort=name');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
    });
    click(`${PAGE}:eq(1) a`);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?page=2&sort=name');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE-1);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=-name');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
    });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', (assert) => {
    var search_two = PREFIX + BASE_URL + '/?page=1&ordering=status__name&search=14';
    xhr(search_two ,'GET',null,{},200,TPF.searched('14', 'number'));
    var page_two = PREFIX + BASE_URL + '/?page=2&ordering=status__name';
    xhr(page_two ,'GET',null,{},200,TPF.searched('', 'number', 2));
    var page_one = PREFIX + BASE_URL + '/?page=1&ordering=status__name';
    xhr(page_one ,'GET',null,{},200,TPF.searched('', 'number'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=status__name&search=4';
    xhr(sort_one ,'GET',null,{},200,TPF.searched('4', 'number'));
    var search_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(search_one,'GET',null,{},200,TPF.searched('4', 'number'));
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
    });
    fillIn(`${SEARCH_INPUT}`, '4');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=4');
        assert.equal(find(GRID_DATA_ALL).length, 2);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGrid);
        assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'4');
    });
    click(SORT_DIR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=4&sort=status.name');
        assert.equal(find(GRID_DATA_ALL).length, 2);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGrid);
        assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'4');
    });
    fillIn(`${SEARCH_INPUT}`, '');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=&sort=status.name');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
        // assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'10');
    });
    click(`${PAGE}:eq(1) a`);
    andThen(() => {
        assert.equal(currentURL(),`${THIRD_PARTY_LIST_URL}?page=2&search=&sort=status.name`);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        // assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGridBase+'2');
        assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'2');
    });
    fillIn(`${SEARCH_INPUT}`, '14');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', NUMBER_ONE);
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=14&sort=status.name');
        assert.equal(find(GRID_DATA_ALL).length, 1);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGrid);
    });
    click(`${RESET_GRID}`);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
    });
});

test('multiple sort options appear in the query string as expected', (assert) => {
    var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=status__name,name';
    xhr(sort_two ,'GET',null,{},200,TPF.sorted('third-party_type,name'));
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
        assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'1');
        assert.equal(find(`${GRID_DATA_2} .t-third-party-name`).text().trim(), TPD.nameOne+'2');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=name');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
        // assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'10'); //firefox discrepancy
    });
    click(SORT_DIR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=status.name%2Cname');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameVz);
        // assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'1');
    });
});

// test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', (assert) => {
//     random.uuid = function() { return UUID.value; };
//     var sort_four = PREFIX + BASE_URL + '/?page=1&ordering=status.name';
//     xhr(sort_four,'GET',null,{},200,TPF.sorted('name,status.name'));
//     var sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-name,status.name';
//     xhr(sort_three,'GET',null,{},200,TPF.sorted('-name,status.name'));
//     var sort_two = PREFIX + BASE_URL + '/?page=1&ordering=status.name,name';
//     xhr(sort_two,'GET',null,{},200,TPF.sorted('status,name'));
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one,'GET',null,{},200,TPF.sorted('name'));
//     visit(THIRD_PARTY_LIST_URL);
//     andThen(() => {
//         assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort'));
//         assert.ok(find(SORT_DIR).hasClass('fa-sort'));
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//         assert.equal(find(`${RESET_GRID}`).length, 0);
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=name');
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.ok(find(SORT_DIR).hasClass('fa-sort'));
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//         assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'1');
//         assert.equal(find(`${GRID_DATA_2} .t-third-party-name`).text().trim(), TPD.nameOne+'10');
//     });
//     click(SORT_DIR);
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=status.name%2Cname');
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.ok(find(SORT_DIR).hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//         assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'1');
//         assert.equal(find(`${GRID_DATA_2} .t-third-party-name`).text().trim(), TPD.nameOne+'10');
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=-name%2Cstatus.name');
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.ok(find(SORT_DIR).hasClass('fa-sort-asc'));
//         assert.ok(find('.t-sort-name-dir').hasClass('fa-sort-desc'));
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGridBase+'8');
//         assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameGridBase+'7');
//         assert.equal(find(`${GRID_DATA_2} .t-third-party-name`).text().trim(), TPD.nameGridBase+'6');
//     });
//     click('.t-sort-name-dir');
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?sort=status.name');
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.ok(find(SORT_DIR).hasClass('fa-sort-asc'));
//         assert.ok(!find('.t-sort-name-dir').hasClass('fa-sort-asc'));
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//         assert.equal(find(`${GRID_DATA_1} .t-third-party-name`).text().trim(), TPD.nameOne+'1');
//         assert.equal(find(`${GRID_DATA_2} .t-third-party-name`).text().trim(), TPD.nameOne+'10');
//     });
//     click(RESET_GRID);
//     andThen(() => {
//         assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//     });
// });

// test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', (assert) => {
//     let find_two = PREFIX + BASE_URL + '/?page=1&status__icontains=i&name__icontains=vzoname';
//     xhr(find_two,'GET',null,{},200,TPF.sorted('status:i,name:vzoname'));
//     let find_one = PREFIX + BASE_URL + '/?page=1&status__icontains=i';
//     xhr(find_one,'GET',null,{},200,TPF.fulltext('status:i', 1));
//     visit(THIRD_PARTY_LIST_URL);
//     andThen(() => {
//         assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//     });
//     filterGrid('status.name', 'i');
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?find=status%3Ai');
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//     });
//     filterGrid('name', 'vzoname');
//     andThen(() => {
//         assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?find=status%3Ai%2Cname%3Avzoname');
//         assert.equal(find(GRID_DATA_ALL).length, 8);
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameGridBase+'1');
//     });
//     click(RESET_GRID);
//     andThen(() => {
//         assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
//         assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
//         assert.equal(find(`${GRID_DATA_0} .t-third-party-name`).text().trim(), TPD.nameOne);
//     });
// });

test('loading screen shown before any xhr and hidden after', (assert) => {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one,'GET',null,{},200,TPF.sorted('name'));
    visitSync(THIRD_PARTY_LIST_URL);
    Ember.run.later(function() {
        assert.equal(find(GRID_DATA_ALL).length, 0);
        // assert.equal(find('.t-grid-loading-graphic').length, 1);
    }, 0);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
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

test('when a full text filter is selected the input inside the modal is focused', (assert) => {
    visit(THIRD_PARTY_LIST_URL);
    click('.t-filter-name');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click(STATUS_FILTER);
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
});

// test('full text searched columns will have a special on css class when active', (assert) => {
//     // let find_three = PREFIX + BASE_URL + '/?page=1&status__name__icontains=&name__icontains=7';
//     // xhr(find_three ,'GET',null,{},200,TPF.sorted('name:7'));
//     let find_two = PREFIX + BASE_URL + '/?page=1&status__name__icontains=in&name__icontains=7';
//     xhr(find_two ,'GET',null,{},200,TPF.sorted('status.name:in,name:7'));
//     let find_one = PREFIX + BASE_URL + '/?page=1&status__name__icontains=in';
//     xhr(find_one ,'GET',null,{},200,TPF.fulltext('status.name:in', 1));
//     visit(THIRD_PARTY_LIST_URL);
//     andThen(() => {
//         assert.ok(!find('.t-filter-name').hasClass('on'));
//         assert.ok(!find(STATUS_FILTER).hasClass('on'));
//     });
//     filterGrid('status', 'in');
//     andThen(() => {
//         assert.ok(!find('.t-filter-name').hasClass('on'));
//         assert.ok(find(STATUS_FILTER).hasClass('on'));
//     });
//     // filterGrid('name', '7');
//     // andThen(() => {
//     //     assert.ok(find('.t-filter-name').hasClass('on'));
//     //     assert.ok(find(STATUS_FILTER).hasClass('on'));
//     // });
//     // filterGrid('status', '');
//     // andThen(() => {
//     //     assert.ok(find('.t-filter-name').hasClass('on'));
//     //     assert.ok(!find(STATUS_FILTER).hasClass('on'));
//     // });
// });

test('after you reset the grid the filter model will also be reset', (assert) => {
    let option_three = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4&name__icontains=4';
    xhr(option_three ,'GET',null,{},200,TPF.sorted('name:4'));
    let option_two = PREFIX + BASE_URL + '/?page=1&ordering=name&search=4';
    xhr(option_two ,'GET',null,{},200,TPF.sorted('name:4'));
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TPF.searched('4', 'id'));
    visit(THIRD_PARTY_LIST_URL);
    fillIn(`${SEARCH_INPUT}`, '4');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=4');
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=4&sort=name');
    });
    filterGrid('name', '4');
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?find=name%3A4&search=4&sort=name');
    });
    click(`${RESET_GRID}`);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
    });
    click('.t-filter-name');
    andThen(() => {
        let name_filter_value = $('.ember-modal-dialog input:first').val();
        assert.equal(name_filter_value, '');
    });
});

test('count is shown and updated as the user filters down the list from django', (assert) => {
    let option_one = PREFIX + BASE_URL + '/?page=1&search=4';
    xhr(option_one ,'GET',null,{},200,TPF.searched('4', 'name'));
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${PAGE}-count`).text(), `${PAGE_SIZE*2-1} ${t('admin.third_party.other')}`);
    });
    fillIn(`${SEARCH_INPUT}`, '4');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', NUMBER_FOUR);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=4');
        assert.equal(find(GRID_DATA_ALL).length, 2);
        assert.equal(find(`${PAGE}-count`).text(), `2 ${t('admin.third_party.other')}`);
    });
    fillIn(`${SEARCH_INPUT}`, '');
    triggerEvent(`${SEARCH_INPUT}`, 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + '?search=');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${PAGE}-count`).text(), `${PAGE_SIZE*2-1} ${t('admin.third_party.other')}`);
    });
});

test('picking a different number of pages will alter the query string and xhr', (assert) => {
    let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
    xhr(option_two, 'GET',null,{},200,TPF.paginated(PAGE_SIZE));
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,TPF.paginated(updated_pg_size));
    let page_two = PREFIX + BASE_URL + '/?page=2';
    xhr(page_two, 'GET',null,{},200,TPF.list_two());
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${PAGE}-size option:selected`).text(), `${PAGE_SIZE} per page`);
        var pagination = find(PAGES);
        assert.equal(pagination.find(PAGE).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(!pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
    click(`${PAGE}:eq(1) a`);
    andThen(() => {
        assert.equal(currentURL(), THIRD_PARTY_LIST_URL + '?page=2');
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE-1);
        var pagination = find(PAGES);
        assert.equal(pagination.find(PAGE).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(!pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
    alterPageSize(`${PAGE}-size`, updated_pg_size);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find(GRID_DATA_ALL).length, updated_pg_size);
        assert.equal(find(`${PAGE}-size option:selected`).text(), `${updated_pg_size} per page`);
        var pagination = find(PAGES);
        assert.equal(pagination.find(PAGE).length, 1);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
    });
    alterPageSize(`${PAGE}-size`, PAGE_SIZE);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + `?page_size=${PAGE_SIZE}`);
        assert.equal(find(GRID_DATA_ALL).length, PAGE_SIZE);
        assert.equal(find(`${PAGE}-size option:selected`).text(), `${PAGE_SIZE} per page`);
        var pagination = find(`${PAGES}`);
        // assert.equal(pagination.find(`${PAGE}`).length, 2);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        // assert.equal(pagination.find(`${PAGE}:eq(1) a`).text(), '2');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
        assert.ok(!pagination.find(`${PAGE}:eq(1) a`).hasClass('active'));
    });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, (assert) => {
    clearxhr(list_xhr);
    const updated_pg_size = PAGE_SIZE*2;
    let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
    xhr(option_one, 'GET',null,{},200,TPF.paginated(updated_pg_size));
    visit(THIRD_PARTY_LIST_URL + `?page_size=${updated_pg_size}`);
    andThen(() => {
        assert.equal(currentURL(),THIRD_PARTY_LIST_URL + `?page_size=${updated_pg_size}`);
        assert.equal(find(GRID_DATA_ALL).length, updated_pg_size);
        assert.equal(find(`${PAGE}-size option:selected`).text(), `${updated_pg_size} per page`);
        var pagination = find(`${PAGES}`);
        assert.equal(pagination.find(`${PAGE}`).length, 1);
        assert.equal(pagination.find(`${PAGE}:eq(0) a`).text(), '1');
        assert.ok(pagination.find(`${PAGE}:eq(0) a`).hasClass('active'));
    });
});

test('when a save filterset modal is selected the input inside the modal is focused', (assert) => {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
    visit(THIRD_PARTY_LIST_URL);
    click('.t-sort-name-dir');
    click('.t-show-save-filterset-modal');
    andThen(() => {
        isFocused('.ember-modal-dialog input:first');
    });
    click(`${SEARCH_INPUT}`);
    andThen(() => {
        isNotFocused('.ember-modal-dialog input:first');
    });
});

// test('save filterset will fire off xhr and add item to the sidebar navigation', (assert) => {
//     random.uuid = function() { return UUID.value; };
//     var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
//     xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
//     let name = 'foobar';
//     let routePath = 'admin.third-parties.index';
//     let url = window.location.toString();
//     let query = '?sort=name';
//     let section = '.t-grid-wrap';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(THIRD_PARTY_LIST_URL);
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

test('delete filterset will fire off xhr and remove item from the sidebar navigation', (assert) => {
    let name = 'foobar';
    let routePath = 'admin.third-parties.index';
    let query = '?foo=bar';
    let navigation = '.t-filterset-wrap div';
    let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
    visit(THIRD_PARTY_LIST_URL);
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

test('save filterset button only available when a dynamic filter is present', (assert) => {
    var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=name';
    xhr(sort_one ,'GET',null,{},200,TPF.sorted('name'));
    visit(THIRD_PARTY_LIST_URL);
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 0);
    });
    click('.t-sort-name-dir');
    andThen(() => {
        assert.equal(find('.t-show-save-filterset-modal').length, 1);
    });
});
