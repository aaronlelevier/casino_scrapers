import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr} from 'bsrs-ember/tests/helpers/xhr';
import PEOPLE_FIXTURES from 'bsrs-ember/vendor/people_fixtures';
import PEOPLE_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const PEOPLE_URL = "/admin/people";
const LETTER_M = {keyCode: 77};
const SPACEBAR = {keyCode: 32};
const NUMBER_EIGHT = {keyCode: 56};
const BACKSPACE = {keyCode: 8};

var application, store;

module('Acceptance | people-grid-list', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + PEOPLE_URL + '/';
        xhr(endpoint ,"GET",null,{},200,PEOPLE_FIXTURES.list());
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('amk initial load should only show first 10 records ordered by id with correct pagination and no additional xhr', function(assert) {
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
        assert.equal(find('.t-person-data:eq(0) .t-person-fullname').text(), PEOPLE_DEFAULTS.first_name + ' ' + PEOPLE_DEFAULTS.last_name);
        assert.equal(find('.t-person-data:eq(0) .t-person-title').text(), PEOPLE_DEFAULTS.title);
        assert.equal(find('.t-person-data:eq(0) .t-person-role-name').text(), t(ROLE_DEFAULTS.nameOne));
        assert.equal(find('.t-person-data:eq(0) .t-person-employee-id').text(), PEOPLE_DEFAULTS.employee_id);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('li').length, 2);
        assert.equal(pagination.find('a:eq(0)').text(), '1');
        assert.equal(pagination.find('a:eq(1)').text(), '2');
        //assert.ok(pagination.find('li:eq(0)').hasClass('active')); //TODO: page 1 should be active
        assert.ok(!pagination.find('a:eq(1)').hasClass('active'));
    });
});

test('clicking page 2 will load in another set of data as well as clicking page 1 after that reloads the original set of data (both require an additional xhr)', function(assert) {
    var page_two = PREFIX + PEOPLE_URL + '/?page=2';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.list_two());
    var page_one = PREFIX + PEOPLE_URL + '/?page=1';
    xhr(page_one ,"GET",null,{},200,PEOPLE_FIXTURES.list());
    visit(PEOPLE_URL);
    click('.t-pages a:eq(1)');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=2');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott11');
        var pagination = find('.t-pages');
        assert.equal(pagination.find('li').length, 2);
        assert.equal(pagination.find('a:eq(0)').text(), '1');
        assert.equal(pagination.find('a:eq(1)').text(), '2');
        assert.ok(!pagination.find('a:eq(0)').hasClass('active'));
        assert.ok(pagination.find('a:eq(1)').hasClass('active'));
    });
    click('.t-pages a:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
        var pagination = find('.t-pages');
        assert.equal(pagination.find('li').length, 2);
        assert.equal(pagination.find('a:eq(0)').text(), '1');
        assert.equal(pagination.find('a:eq(1)').text(), '2');
        assert.ok(pagination.find('a:eq(0)').hasClass('active'));
        assert.ok(!pagination.find('a:eq(1)').hasClass('active'));
    });
});

test('clicking header will sort by given property and reset page to 1 (also requires an additional xhr)', function(assert) {
    var sort_two = PREFIX + PEOPLE_URL + '/?page=1&ordering=title';
    xhr(sort_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('title', 1));
    var page_two = PREFIX + PEOPLE_URL + '/?page=2&ordering=username';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 2));
    var sort_one = PREFIX + PEOPLE_URL + '/?page=1&ordering=username';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.sorted('username', 1));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-sort-username');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&sort=username');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-pages a:eq(1)');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=2&sort=username');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott11');
    });
    click('.t-sort-title');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&sort=title');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
});

test('typing a search will reset page to 1 and require an additional xhr', function(assert) {
    var search_two = PREFIX + PEOPLE_URL + '/?page=1&ordering=title&search=8%20m';
    xhr(search_two ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8 m', 'title'));
    var page_two = PREFIX + PEOPLE_URL + '/?page=2&ordering=title';
    xhr(page_two ,"GET",null,{},200,PEOPLE_FIXTURES.searched('', 'title', 2));
    var page_one = PREFIX + PEOPLE_URL + '/?page=1&ordering=title';
    xhr(page_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('', 'title'));
    var sort_one = PREFIX + PEOPLE_URL + '/?page=1&ordering=title&search=8';
    xhr(sort_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8', 'title'));
    var search_one = PREFIX + PEOPLE_URL + '/?page=1&search=8';
    xhr(search_one ,"GET",null,{},200,PEOPLE_FIXTURES.searched('8', 'id'));
    visit(PEOPLE_URL);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL);
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    fillIn('.t-grid-search-input', '8');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&search=8');
        assert.equal(find('.t-person-data').length, 2);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson8');
        assert.equal(find('.t-person-data:eq(1) .t-person-username').text(), 'scott18');
    });
    click('.t-sort-title');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&search=8&sort=title');
        assert.equal(find('.t-person-data').length, 2);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'scott18');
        assert.equal(find('.t-person-data:eq(1) .t-person-username').text(), 'mgibson8');
    });
    fillIn('.t-grid-search-input', '');
    triggerEvent('.t-grid-search-input', 'keyup', BACKSPACE);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&search=&sort=title');
        assert.equal(find('.t-person-data').length, 10);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), PEOPLE_DEFAULTS.username);
    });
    click('.t-pages a:eq(1)');
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=2&search=&sort=title');
        assert.equal(find('.t-person-data').length, 9);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson2');
    });
    fillIn('.t-grid-search-input', '8 m');
    triggerEvent('.t-grid-search-input', 'keyup', NUMBER_EIGHT);
    triggerEvent('.t-grid-search-input', 'keyup', SPACEBAR);
    triggerEvent('.t-grid-search-input', 'keyup', LETTER_M);
    andThen(() => {
        assert.equal(currentURL(),PEOPLE_URL + '?page=1&search=8%20m&sort=title');
        assert.equal(find('.t-person-data').length, 1);
        assert.equal(find('.t-person-data:eq(0) .t-person-username').text(), 'mgibson8');
    });
});
