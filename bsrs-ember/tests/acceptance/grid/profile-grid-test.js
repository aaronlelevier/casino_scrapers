import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import page from 'bsrs-ember/tests/pages/profile';
import generalPage from 'bsrs-ember/tests/pages/general';
import {isDisabledElement, isNotDisabledElement} from 'bsrs-ember/tests/helpers/disabled';
import UUID from 'bsrs-ember/vendor/defaults/uuid';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_profile_url;
const LIST_URL = `${BASE_URL}/index`;
const DETAIL_URL = `${BASE_URL}/${PD.idZero}`;
const API_LIST_URL = `${PREFIX}${BASE_URL}/`;
const API_DETAIL_URL = `${PREFIX}${BASE_URL}/${PD.idZero}/`;

const NUMBER_FOUR = {keyCode: 52};

let application, store, listData, listXhr, run = Ember.run;

moduleForAcceptance('Acceptance | profile-grid-test', {
  beforeEach() {
    
    store = this.application.__container__.lookup('service:simpleStore');
    listData = PF.list();
    listXhr = xhr(API_LIST_URL + '?page=1', 'GET', null, {}, 200, listData);
  },
  afterEach() {
    
  }
});

test('template translation tags as variables', function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(generalPage.gridTitle, t('admin.profile.other'));
    assert.equal(Ember.$('.t-grid-search-input').get(0)['placeholder'], t('admin.profile.search'));
    assert.equal(generalPage.gridPageCountText, '19 '+t('admin.profile.other'));
    // column headers
    assert.equal(page.descSortText, t('admin.profile.label.description'));
    assert.equal(page.assigneeSortText, t('admin.profile.label.assignee'));
  });
});

test(`initial load should only show first ${PAGE_SIZE} records ordered by id with correct pagination and no additional xhr`, function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-title').text(), 'Profiles');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(page.descGridOne, PD.descOne+"0");
    assert.equal(page.assigneeGridOne, PD.username+"0");
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
  xhr(page_two ,"GET",null,{},200,PF.list());
  visit(LIST_URL);
  click('.t-page:eq(1) a');
  andThen(() => {
    const profiles = store.find('profile-list');
    assert.equal(profiles.get('length'), 20);
    assert.equal(currentURL(), LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-profile-description').text().trim()), PD.descOne);
    assert.equal(substring_up_to_num(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim()), PD.username.slice(0,-1));
    var pagination = find('.t-pages');
    assert.equal(pagination.find('.t-page').length, 2);
    assert.equal(pagination.find('.t-page:eq(0) a').text(), '1');
    assert.equal(pagination.find('.t-page:eq(1) a').text(), '2');
    assert.ok(!pagination.find('.t-page:eq(0) a').hasClass('active'));
    assert.ok(pagination.find('.t-page:eq(1) a').hasClass('active'));
  });
  click('.t-page:eq(0) a');
  andThen(() => {
    const profiles = store.find('profile-list');
    assert.equal(profiles.get('length'), 20);
    assert.equal(currentURL(),LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
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
  xhr(page_two ,"GET",null,{},200,PF.list_two());
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-next a');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"10");
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), `${PD.usernameGridOne.slice(0,-1)}10`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-previous a');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
  click('.t-last a');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?page=2');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"10");
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), `${PD.usernameGridOne.slice(0,-1)}10`);
    isNotDisabledElement('.t-first');
    isNotDisabledElement('.t-previous');
    isDisabledElement('.t-next');
    isDisabledElement('.t-last');
  });
  click('.t-first a');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
    isDisabledElement('.t-first');
    isDisabledElement('.t-previous');
    isNotDisabledElement('.t-next');
    isNotDisabledElement('.t-last');
  });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=description';
  xhr(sort_one ,"GET",null,{},200,PF.sorted_page_one('description'));
  visit(LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
  });
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?sort=description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"0");
  });
});

// description search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descGridOne);
  });
  const searchText = '4';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,"GET",null,{},200, PF.searched(searchText, 'description', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 2);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descOne+"14");
    assert.equal(find('.t-grid-data:eq(1) .t-profile-description').text().trim(), PD.descOne+"4");
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descGridOne);
  });
});

test('multiple sort options appear in the query string as expected', function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descGridOne);
  });
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=description';
  xhr(sort_one ,"GET",null,{},200, PF.sorted_page_one('description'));
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?sort=description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descGridOne);
  });
  var sort = PREFIX + BASE_URL + '/?page=1&ordering=-description';
  xhr(sort ,"GET",null,{},200, PF.list_reverse());
  click('.t-sort-description-dir');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?sort=-description');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-description').text().trim(), PD.descGridOneReverse);
  });
});

// assignee.username search/sort

test('typing a search will reset page to 1 and require an additional xhr and reset will clear any query params', function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
  });
  const searchText = '10';
  var search_two = PREFIX + BASE_URL + `/?page=1&search=${searchText}`;
  xhr(search_two ,"GET",null,{},200, PF.searched(searchText, 'description', 1));
  fillIn('.t-grid-search-input', searchText);
  triggerEvent('.t-grid-search-input', 'keyup', NUMBER_FOUR);
  andThen(() => {
    assert.equal(currentURL(),LIST_URL + `?search=${searchText}`);
    assert.equal(find('.t-grid-data').length, 1);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridTen);
  });
  click('.t-reset-grid');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
  });
});

test('sort by assignee username', function(assert) {
  visit(LIST_URL);
  andThen(() => {
    assert.equal(currentURL(), LIST_URL);
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
  });
  var sort_one = PREFIX + BASE_URL + '/?page=1&ordering=assignee__username';
  xhr(sort_one ,"GET",null,{},200, PF.sorted_page_one('assignee'));
  click('.t-sort-assignee-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?sort=assignee.username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridOne);
  });
  var sort = PREFIX + BASE_URL + '/?page=1&ordering=-assignee__username';
  xhr(sort ,"GET",null,{},200, PF.list_reverse());
  click('.t-sort-assignee-fullname-dir');
  andThen(() => {
    assert.equal(currentURL(), LIST_URL + '?sort=-assignee.username');
    assert.equal(find('.t-grid-data').length, PAGE_SIZE);
    assert.equal(find('.t-grid-data:eq(0) .t-profile-assignee-fullname').text().trim(), PD.usernameGridTen);
  });
});
