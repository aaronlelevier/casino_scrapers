import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + CATEGORY_DEFAULTS.idOne;
const SUBMIT_BTN = '.submit_btn';
const SAVE_BTN = '.t-save-btn';

var application, store, endpoint;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + CATEGORIES_URL + '/';
        xhr(PREFIX + BASE_URL + '/' + CATEGORY_DEFAULTS.idOne + '/', 'GET', null, {}, 200, CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne));
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('sco clicking a categories name will redirect to the given detail view', (assert) => {
    xhr(endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
    click('.t-categories-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('sco when you deep link to the category detail view you get bound attrs', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        var category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.ok(category.get('isNotDirty'));
        assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(find('.t-category-description').val(), CATEGORY_DEFAULTS.descriptionRepair);
    });
    var url = PREFIX + DETAIL_URL + '/';
    var response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    var payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    andThen(() => {
        var category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.ok(category.get('isDirty'));
    });
    var list = CATEGORY_FIXTURES.list();
    list.results[0].name = CATEGORY_DEFAULTS.nameTwo;
    xhr(endpoint, 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category').get('length'), 5);
        var category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.ok(category.get('isNotDirty'));
    });
});

