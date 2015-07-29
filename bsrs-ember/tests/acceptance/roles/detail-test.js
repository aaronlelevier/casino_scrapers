import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import ROLE_FIXTURES from 'bsrs-ember/vendor/role_fixtures';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import ROLE_DEFAULTS from 'bsrs-ember/vendor/defaults/role';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import config from 'bsrs-ember/config/environment';

const PREFIX = config.APP.NAMESPACE;
const ROLE_URL = '/admin/roles';
const DETAIL_URL = ROLE_URL + '/' + ROLE_DEFAULTS.id;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store;

module('Acceptance | role-detail', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        var endpoint = PREFIX + ROLE_URL + '/';
        xhr(endpoint, 'GET', null, {}, 200, ROLE_FIXTURES.list());
        xhr(endpoint + ROLE_DEFAULTS.id + '/', 'GET', null, {}, 200, ROLE_FIXTURES.detail(ROLE_DEFAULTS.id));
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a role name will redirect to the given detail view', (assert) => {
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(),ROLE_URL);
    });
    click('.t-role-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
});

test('when you deep link to the role detail view you get bound attrs', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
        assert.equal(find('.t-role-name').val(), ROLE_DEFAULTS.name);
        assert.equal(find('.t-role-role-type').val(), ROLE_DEFAULTS.role_type_general);
        // assert.equal(find('.t-role-category').val(), CATEGORY_DEFAULTS.category);
        // assert.equal(find('.t-role-location_level').val(), ROLE_DEFAULTS.location_level);
    });
    var url = PREFIX + DETAIL_URL + '/';
    var response = ROLE_FIXTURES.detail(ROLE_DEFAULTS.id);
    var categories = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.id, name: CATEGORY_DEFAULTS.name});
    var payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.id, name: ROLE_DEFAULTS.namePut, categories: categories});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-role-name', ROLE_DEFAULTS.namePut);
    fillIn('.t-role-name', ROLE_DEFAULTS.namePut);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('when you change a related category name it will be persisted correctly', (assert) => {
    visit(DETAIL_URL);
    var url = PREFIX + DETAIL_URL + "/";
    var categories = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.id, name: CATEGORY_DEFAULTS.nameTwo});
    var payload = ROLE_FIXTURES.put({id: ROLE_DEFAULTS.id, categories});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(ROLE_URL);
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
    click('.t-role-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(currentURL(), ROLE_URL);
    });
});

