import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PF from 'bsrs-ember/vendor/people_fixtures';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import SD from 'bsrs-ember/vendor/defaults/status';
import config from 'bsrs-ember/config/environment';
import BASEURLS, { PEOPLE_LIST_URL, EXPORT_DATA_URL } from 'bsrs-ember/utilities/urls';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import {isNotFocused} from 'bsrs-ember/tests/helpers/focus';
import {isFocused} from 'bsrs-ember/tests/helpers/input';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';

const PD = PERSON_DEFAULTS.defaults();
const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_people_url;
const LETTER_M = {keyCode: 77};
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};
const NUMBER_EIGHT = {keyCode: 56};
const BACKSPACE = {keyCode: 8};
const SORT_STATUS_DIR = '.t-sort-status-translated-name-dir';

let endpoint, list_xhr;

moduleForAcceptance('Acceptance | people grid list', {
  beforeEach() {
    endpoint = PREFIX + BASE_URL + '/?page=1';
    list_xhr = xhr(endpoint ,"GET",null,{},200,PF.list());
  },
});

test('initial load should only show first 10 records ordered by fullname with correct pagination and no additional xhr', function(assert) {
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL);
    assert.equal(document.title,  t('doctitle.people.index', { count: 10 }));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
    assert.equal(find('.t-grid-data:eq(0) .t-person-fullname').text().trim(), PD.fullname);
    assert.equal(find('.t-grid-data:eq(0) .t-person-title').text().trim(), PD.title);
    assert.equal(find('.t-grid-data:eq(0) .t-person-role-name').text().trim(), RD.nameOne);
    pagination(assert);
    assert.equal(find('[data-test-id="username"]').attr('scope'), 'col', 'shows col accessibility html attribute');
  });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
  visit(PEOPLE_LIST_URL);
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,PF.list_two());
  click('.t-page:eq(1) a');
  andThen(() => {
    const people = this.store.find('person-list');
    assert.equal(people.get('length'), 8);
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), 'scott11');
    pagination2(assert);
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const people = this.store.find('person-list');
    assert.equal(people.get('length'), 10);
    assert.equal(currentURL(),PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
    pagination(assert);
  });
});

test('clicking first,last,next and previous will request page 1 and 2 correctly', function(assert) {
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two ,"GET",null,{},200,PF.list_two());
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  let sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
  xhr(sort_two ,"GET",null,{},200,PF.sorted_page_one('title,username'));
  let page_two = PREFIX + BASE_URL + '/?page=2&ordering=username';
  xhr(page_two ,"GET",null,{},200,PF.sorted_page_two('username'));
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,"GET",null,{},200,PF.sorted_page_one('username'));
  visit(PEOPLE_LIST_URL);
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?sort=username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2&sort=username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-title-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=title%2Cusername');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
});

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  let search_two = PREFIX + BASE_URL + '/?page=1&ordering=title&search=8%20m';
  xhr(search_two ,"GET",null,{},200,PF.searched('8 m', 'title'));
  let page_two = PREFIX + BASE_URL + '/?page=2&ordering=title';
  xhr(page_two ,"GET",null,{},200,PF.searched('', 'title', 2));
  let page_one = PREFIX + BASE_URL + '/?page=1&ordering=title';
  xhr(page_one ,"GET",null,{},200,PF.searched('', 'title'));
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=title&search=8';
  xhr(sort_one ,"GET",null,{},200,PF.searched('8', 'title'));
  let search_one = PREFIX + BASE_URL + '/?page=1&search=8';
  xhr(search_one ,"GET",null,{},200,PF.searched('8', 'id'));
  visit(PEOPLE_LIST_URL);
  fillIn('.t-grid-search-input', '8');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=8');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'scott');
  });
  click('.t-sort-title-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=8&sort=title');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE/5);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(1) .t-person-username').text().trim()), 'mgibson');
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'scott');
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=&sort=title');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?page=2&search=&sort=title');
    assert.ok(find('.t-grid-data').length < PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'mgibson');
  });
  fillIn('.t-grid-search-input', '8 m');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
  triggerEvent('.t-grid-search-input', 'keyup', SPACEBAR);
  triggerEvent('.t-grid-search-input', 'keyup', LETTER_M);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=8%20m&sort=title');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'mgibson');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  let sort_four = PREFIX + BASE_URL + '/?page=1&ordering=-fullname,title,username';
  xhr(sort_four ,"GET",null,{},200,PF.sorted('fullname,title,username'));
  let sort_three = PREFIX + BASE_URL + '/?page=1&ordering=fullname,title,username';
  xhr(sort_three ,"GET",null,{},200,PF.sorted('fullname,title,username'));
  let sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
  xhr(sort_two ,"GET",null,{},200,PF.sorted('title,username'));
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,"GET",null,{},200,PF.sorted('username'));
  visit(PEOPLE_LIST_URL);
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-title-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=title%2Cusername');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=fullname%2Ctitle%2Cusername');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=-fullname%2Ctitle%2Cusername');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
});

test('clicking the same sort option over and over will flip the direction and reset will remove any sort query param', function(assert) {
  let sort_four = PREFIX + BASE_URL + '/?page=1&ordering=title';
  xhr(sort_four ,"GET",null,{},200,PF.sorted('username,title'));
  let sort_three = PREFIX + BASE_URL + '/?page=1&ordering=-username,title';
  xhr(sort_three ,"GET",null,{},200,PF.sorted('-username,title'));
  let sort_two = PREFIX + BASE_URL + '/?page=1&ordering=title,username';
  xhr(sort_two ,"GET",null,{},200,PF.sorted('title,username'));
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,"GET",null,{},200,PF.sorted('username'));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-username-dir').hasClass('fa-sort'));
    assert.ok(find('.t-sort-title-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
    assert.equal(find('.t-reset-grid').length, 0);
  });
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-title-dir').hasClass('fa-sort'));
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-title-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=title%2Cusername');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=-username%2Ctitle');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
    assert.ok(find('.t-sort-username-dir').hasClass('fa-sort-desc'));
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?sort=title');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.ok(find('.t-sort-title-dir').hasClass('fa-sort-asc'));
    assert.ok(!find('.t-sort-username-dir').hasClass('fa-sort-asc'));
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.scott_username);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
});

test('full text search will filter down the result set and query django accordingly and reset clears all full text searches', function(assert) {
  let find_four = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=lelevier&fullname__icontains=ewcomer';
  xhr(find_four ,"GET",null,{},200,PF.sorted('title:wat,username:lelevier,fullname:ewcomer'));
  let find_three = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7&fullname__icontains=ewcomer';
  xhr(find_three ,"GET",null,{},200,PF.sorted('title:wat,username:7,fullname:S'));
  let find_two = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7';
  xhr(find_two ,"GET",null,{},200,PF.sorted('title:wat,username:7'));
  let find_one = PREFIX + BASE_URL + '/?page=1&title__icontains=wat';
  xhr(find_one ,"GET",null,{},200,PF.fulltext('title:wat', 1));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
  filterGrid('title', 'wat');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=title%3Awat');
    assert.ok(find('.t-grid-data').length < PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'scott');
  });
  filterGrid('username', '7');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=title%3Awat%2Cusername%3A7');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'scott');
  });
  click('.t-filter-fullname');
  filterGrid('fullname', 'ewcomer');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=title%3Awat%2Cusername%3A7%2Cfullname%3Aewcomer');
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-person-username').text().trim()), 'scott');
  });
  click('.t-filter-fullname');
  filterGrid('username', 'lelevier');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=title%3Awat%2Cusername%3Alelevier%2Cfullname%3Aewcomer');
    assert.equal(find('.t-grid-data').length, 0);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
});

test('loading screen shown before any xhr and hidden after', function(assert) {
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,"GET",null,{},200,PF.sorted('username'));
  visitSync(PEOPLE_LIST_URL);
  Ember.run.later(function() {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  }, 0);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
  andThen(() => {
    Ember.$('.t-sort-username-dir').click();
    assert.equal(find('.t-grid-loading-graphic').length, 1);
  });
  andThen(() => {
    assert.equal(find('.t-grid-loading-graphic').length, 0);
  });
});

test('when a full text filter is selected the input inside the modal is focused', function(assert) {
  visit(PEOPLE_LIST_URL);
  click('.t-filter-fullname');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
  click('.t-filter-title');
  andThen(() => {
    isFocused('.ember-modal-dialog input:first');
  });
});

test('full text searched columns will have a special on css class when active', function(assert) {
  let find_four = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&fullname__icontains=ewcomer';
  xhr(find_four ,"GET",null,{},200,PF.sorted('title:wat,fullname:ewcomer'));
  let find_three = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7&fullname__icontains=ewcomer';
  xhr(find_three ,"GET",null,{},200,PF.sorted('title:wat,username:7,fullname:S'));
  let find_two = PREFIX + BASE_URL + '/?page=1&title__icontains=wat&username__icontains=7';
  xhr(find_two ,"GET",null,{},200,PF.sorted('title:wat,username:7'));
  let find_one = PREFIX + BASE_URL + '/?page=1&title__icontains=wat';
  xhr(find_one ,"GET",null,{},200,PF.fulltext('title:wat', 1));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.ok(!find('.t-filter-fullname').hasClass('on'));
    assert.ok(!find('.t-filter-username').hasClass('on'));
    assert.ok(!find('.t-filter-title').hasClass('on'));
  });
  filterGrid('title', 'wat');
  andThen(() => {
    assert.ok(!find('.t-filter-fullname').hasClass('on'));
    assert.ok(!find('.t-filter-username').hasClass('on'));
    assert.ok(find('.t-filter-title').hasClass('on'));
  });
  filterGrid('username', '7');
  andThen(() => {
    assert.ok(!find('.t-filter-fullname').hasClass('on'));
    assert.ok(find('.t-filter-username').hasClass('on'));
    assert.ok(find('.t-filter-title').hasClass('on'));
  });
  filterGrid('fullname', 'ewcomer');
  andThen(() => {
    assert.ok(find('.t-filter-fullname').hasClass('on'));
    assert.ok(find('.t-filter-username').hasClass('on'));
    assert.ok(find('.t-filter-title').hasClass('on'));
  });
  filterGrid('username', '');
  andThen(() => {
    assert.ok(find('.t-filter-fullname').hasClass('on'));
    assert.ok(!find('.t-filter-username').hasClass('on'));
    assert.ok(find('.t-filter-title').hasClass('on'));
  });
});

test('after you reset the grid the filter model will also be reset', function(assert) {
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=username&search=m&username__icontains=gib';
  xhr(option_three ,'GET',null,{},200,PF.sorted('username:m'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=username&search=m';
  xhr(option_two ,'GET',null,{},200,PF.sorted('username:m'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=m';
  xhr(option_one ,'GET',null,{},200,PF.searched('m', 'id'));
  visit(PEOPLE_LIST_URL);
  fillIn('.t-grid-search-input', 'm');
  triggerEvent('.t-grid-search-input', 'keyup', LETTER_M);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=m');
  });
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=m&sort=username');
  });
  filterGrid('username', 'gib');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=username%3Agib&search=m&sort=username');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
  });
  click('.t-filter-username');
  andThen(() => {
    let username_filter_value = $('.ember-modal-dialog input:first').val();
    assert.equal(username_filter_value, '');
  });
});

test('count is shown and updated as the user filters down the list from django', function(assert) {
  let option_one = PREFIX + BASE_URL + '/?page=1&search=8';
  xhr(option_one ,'GET',null,{},200,PF.searched('(8)', 'id'));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-2} People`);
  });
  fillIn('.t-grid-search-input', '8');
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=8');
    // assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-2} People`);
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-count').text(), `${PAGE_SIZE*2-2} People`);
  });
});

test('picking a different number of pages will alter the query string and xhr', function(assert) {
  let option_two = PREFIX + BASE_URL + `/?page=1&page_size=${PAGE_SIZE}`;
  xhr(option_two, 'GET',null,{},200,PF.paginated(PAGE_SIZE));
  const updated_pg_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_pg_size}`;
  xhr(option_one, 'GET',null,{},200,PF.paginated(updated_pg_size));
  let page_two = PREFIX + BASE_URL + '/?page=2';
  xhr(page_two, 'GET',null,{},200,PF.list_two());
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    let pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(1) a');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    let pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', updated_pg_size);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + `?page_size=${updated_pg_size}`);
    assert.equal(find('.t-grid-data').length, updated_pg_size-2);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_pg_size} per page`);
    let pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
  alterPageSize('.t-page-size', PAGE_SIZE);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + `?page_size=${PAGE_SIZE}`);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-page-size option:selected').text(), `${PAGE_SIZE} per page`);
    let pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text().trim(), '2');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(!pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
});

test(`starting with a page size greater than ${PAGE_SIZE} will set the selected`, function(assert) {
  clearxhr(list_xhr);
  const updated_size = PAGE_SIZE*2;
  let option_one = PREFIX + BASE_URL + `/?page=1&page_size=${updated_size}`;
  xhr(option_one, 'GET',null,{},200,PF.paginated(updated_size));
  visit(`${PEOPLE_LIST_URL}?page_size=${updated_size}`);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + `?page_size=${updated_size}`);
    assert.equal(find('.t-grid-data').length, updated_size-2);
    assert.equal(find('.t-page-size option:selected').text(), `${updated_size} per page`);
    let pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 1);
    assert.equal(pagination.find('.t-page:eq(0) a').text().trim(), '1');
    assert.ok(pagination.find('.t-page:eq(0) a').hasClass('active'));
  });
});

test('when a save filterset modal is selected the input inside the modal is focused', function(assert) {
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,'GET',null,{},200,PF.sorted('username'));
  visit(PEOPLE_LIST_URL);
  click('.t-sort-username-dir');
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
//     let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
//     xhr(sort_one ,'GET',null,{},200,PF.sorted('username'));
//     let name = 'foobar';
//     let routePath = 'admin.people.index';
//     let url = window.location.toString();
//     let query = '?sort=username';
//     let section = '.t-grid-wrap';
//     let navigation = '.t-filterset-wrap li';
//     let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
//     visit(PEOPLE_LIST_URL);
//     click('.t-sort-username-dir');
//     click('.t-show-save-filterset-modal');
//     xhr('/api/admin/saved-searches/', 'POST', JSON.stringify(payload), {}, 200, {});
//     saveFilterSet(name, routePath);
//     andThen(() => {
//         let html = find(section);
//         assert.equal(html.find(navigation).length, 3);
//         let filterset = this.store.find('filterset', UUID.value);
//         assert.equal(filterset.get('name'), name);
//         assert.equal(filterset.get('endpoint_name'), routePath);
//         assert.equal(filterset.get('endpoint_uri'), query);
//     });
// });

test('delete filterset will fire off xhr and remove item from the sidebar navigation', function(assert) {
  let name = 'foobar';
  let routePath = 'admin.people.index';
  let query = '?foo=bar';
  let navigation = '.t-filterset-wrap div';
  let payload = {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query};
  visit(PEOPLE_LIST_URL);
  clearAll(this.store, 'filterset');
  andThen(() => {
   this.store.push('filterset', {id: UUID.value, name: name, endpoint_name: routePath, endpoint_uri: query});
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
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=username';
  xhr(sort_one ,'GET',null,{},200,PF.sorted('username'));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 0);
  });
  click('.t-sort-username-dir');
  andThen(() => {
    assert.equal(find('.t-show-save-filterset-modal').length, 1);
  });
});

test('typing a search will search on related', function(assert) {
  let page_one = PREFIX + BASE_URL + '/?page=1&ordering=title';
  xhr(page_one ,"GET",null,{},200,PF.searched_related(RD.idTwo, 'role'));
  let sort_one = PREFIX + BASE_URL + '/?page=1&ordering=title&search=manager';
  xhr(sort_one ,"GET",null,{},200,PF.searched_related(RD.idTwo, 'role'));
  let search_one = PREFIX + BASE_URL + '/?page=1&search=manager';
  xhr(search_one ,"GET",null,{},200,PF.searched_related(RD.idTwo, 'role'));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(1) .t-person-role-name').text().trim(), RD.nameOne);
  });
  fillIn('.t-grid-search-input', 'manager');
  triggerEvent('.t-grid-search-input', 'keyup', LETTER_M);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=manager');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(1) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(2) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(3) .t-person-role-name').text().trim(), RD.nameTwo);
  });
  click('.t-sort-title-dir');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=manager&sort=title');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(1) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(2) .t-person-role-name').text().trim(), RD.nameTwo);
    assert.equal(find('.t-grid-data:eq(3) .t-person-role-name').text().trim(), RD.nameTwo);
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=&sort=title');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), 'scott11');
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-username').text().trim(), PD.username);
  });
});

test('status.translated_name is a functional related filter', function(assert) {
  let option_four = PREFIX + BASE_URL + '/?page=1&ordering=-status__name&status__name__icontains=rr';
  xhr(option_four,'GET',null,{},200,PF.searched_related(SD.activeId, 'status'));
  let option_three = PREFIX + BASE_URL + '/?page=1&ordering=-status__name';
  xhr(option_three,'GET',null,{},200,PF.searched_related(SD.inactiveId, 'status'));
  let option_two = PREFIX + BASE_URL + '/?page=1&ordering=status__name';
  xhr(option_two,'GET',null,{},200,PF.searched_related(SD.activeId, 'status'));
  let option_one = PREFIX + BASE_URL + '/?page=1&search=a';
  xhr(option_one,'GET',null,{},200,PF.searched_related(SD.activeId, 'status'));
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), PEOPLE_LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-status-translated_name').text().trim(), t(SD.activeName));
  });
  fillIn('.t-grid-search-input', 'a');
  triggerEvent('.t-grid-search-input', 'keyup', LETTER_A);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=a');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-status-translated_name').text().trim(), t(SD.activeName));
  });
  fillIn('.t-grid-search-input', '');
  triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=');
    assert.equal(find('.t-grid-data:eq(0) .t-person-status-translated_name').text().trim(), t(SD.activeName));
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
  });
  click(SORT_STATUS_DIR);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=&sort=status.translated_name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-person-status-translated_name').text().trim(), t(SD.activeName));
  });
  click(SORT_STATUS_DIR);
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?search=&sort=-status.translated_name');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE-2);
    assert.equal(find('.t-grid-data:eq(0) .t-person-status-translated_name').text().trim(), t(SD.inactiveName));
  });
  filterGrid('status.translated_name', 'rr');
  andThen(() => {
    assert.equal(currentURL(),PEOPLE_LIST_URL + '?find=status.translated_name%3Arr&search=&sort=-status.translated_name');
    assert.equal(find('.t-grid-data').length, 0);
  });
});

test('export csv button shows in grid header', (assert) => {
  visit(PEOPLE_LIST_URL);
  andThen(() => {
    assert.equal(find('[data-test-id="grid-export-btn"]').length, 1);
    assert.equal(find('[data-test-id="grid-export-btn"]').text().trim(), t('grid.export'));
  });
  xhr(`${EXPORT_DATA_URL}person/`, 'GET', null, {}, 200, undefined);
  click('[data-test-id="grid-export-btn"]');
});
