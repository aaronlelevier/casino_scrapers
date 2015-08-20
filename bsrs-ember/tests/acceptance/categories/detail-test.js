import Ember from 'ember';
import { test } from 'qunit';
import module from 'bsrs-ember/tests/helpers/module';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
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
const CANCEL_BTN = '.t-cancel-btn';

let application, store, endpoint, list_xhr;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
        xhr(endpoint + CATEGORY_DEFAULTS.idOne + '/', 'GET', null, {}, 200, CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne));
    },
    afterEach() {
        Ember.run(application, 'destroy');
    }
});

test('clicking a categories name will redirect to the given detail view', (assert) => {
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
    click('.t-categories-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
    });
});

test('when you deep link to the category detail view you get bound attrs', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.ok(category.get('isNotDirty'));
        assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(find('.t-category-description').val(), CATEGORY_DEFAULTS.descriptionRepair);
        assert.equal(find('.t-category-label').val(), CATEGORY_DEFAULTS.labelOne);
        assert.equal(find('.t-amount').val(), CATEGORY_DEFAULTS.costAmountOne);
        assert.equal(find('.t-category-cost-code').val(), CATEGORY_DEFAULTS.costCodeOne);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameTwo, description: CATEGORY_DEFAULTS.descriptionMaintenance, 
    label: CATEGORY_DEFAULTS.labelTwo, cost_amount: CATEGORY_DEFAULTS.costAmountTwo, cost_code: CATEGORY_DEFAULTS.costCodeTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountTwo);
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeTwo);
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.ok(category.get('isDirty'));
    });
    let list = CATEGORY_FIXTURES.list();
    list.results[0].name = CATEGORY_DEFAULTS.nameTwo;
    list.results[0].description = CATEGORY_DEFAULTS.descriptionMaintenance;
    list.results[0].label = CATEGORY_DEFAULTS.labelTwo;
    list.results[0].cost_amount = CATEGORY_DEFAULTS.costAmountTwo;
    list.results[0].cost_code = CATEGORY_DEFAULTS.costCodeTwo;
    //just leaving here until I can figure out how to do destructuring w/o jshint blowing up on me. 
    // let results = list.results[0];
    // ({nameTwo: results.name, descriptionMaintenance: results.description, labelTwo: results.label, costAmountTwo: results.cost_amount, costCodeTwo: results.cost_code} = CATEGORY_DEFAULTS);
    xhr(endpoint, 'GET', null, {}, 200, list);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category').get('length'), 23);
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameTwo);
        assert.equal(category.get('description'), CATEGORY_DEFAULTS.descriptionMaintenance);
        assert.equal(category.get('label'), CATEGORY_DEFAULTS.labelTwo);
        assert.equal(category.get('cost_amount'), CATEGORY_DEFAULTS.costAmountTwo);
        assert.equal(category.get('cost_code'), CATEGORY_DEFAULTS.costCodeTwo);
        assert.ok(category.get('isNotDirty'));
    });
});

test('when you click cancel, you are redirected to the category list view', (assert) => {
    visit(DETAIL_URL);
    click(CANCEL_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when editing the category name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    fillIn('.t-category-name', '');
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'invalid name');
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    let url = PREFIX + DETAIL_URL + "/";
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameTwo);
    click(CANCEL_BTN);
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameTwo);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when click delete, category is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + CATEGORY_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    click('.t-delete-btn');
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});
