import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + UUID.value;
const CATEGORY_NEW_URL = BASE_URL + '/new';
const SAVE_BTN = '.t-save-btn';

let application, store, payload, list_xhr;

module('Acceptance | category-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: CATEGORY_DEFAULTS.nameOne,
            description: CATEGORY_DEFAULTS.descriptionMaintenance,
            cost_amount: CATEGORY_DEFAULTS.costAmountOne,
            cost_code: CATEGORY_DEFAULTS.costCodeOne,
            label: CATEGORY_DEFAULTS.labelOne,
            subcategory_label: CATEGORY_DEFAULTS.subCatLabelTwo,
            parent: [],
            children: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + "/";
        list_xhr = xhr(endpoint, "GET", null, {}, 200, CATEGORY_FIXTURES.empty());
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
        list_xhr = null;
    }
});

test('visiting /category/new', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORIES_URL);
    click('.t-category-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.equal(store.find('category').get('length'), 1);
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category').get('length'), 1);
        let category = store.find('category').objectAt(0);
        assert.equal(category.get('id'), UUID.value);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameOne);
        assert.equal(category.get('description'), CATEGORY_DEFAULTS.descriptionMaintenance);
        assert.equal(category.get('label'), CATEGORY_DEFAULTS.labelOne);
        assert.equal(category.get('subcategory_label'), CATEGORY_DEFAULTS.subCatLabelTwo);
        assert.equal(category.get('cost_amount'), CATEGORY_DEFAULTS.costAmountOne);
        assert.equal(category.get('cost_code'), CATEGORY_DEFAULTS.costCodeOne);
        assert.ok(category.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    let url = PREFIX + BASE_URL + '/';
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response );
    visit(CATEGORIES_URL);
    click('.t-category-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(list_xhr);
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORY_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORY_NEW_URL);
            assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    click('.t-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORY_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            let category = store.find('category', {id: UUID.value});
            assert.equal(category.get('length'), 1);
        });
    });
    click('.t-modal-footer .t-modal-rollback-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORIES_URL);
            assert.equal(find('.t-modal').is(':hidden'), true);
            let category = store.find('category', {id: UUID.value});
            assert.equal(category.get('length'), 0);
            assert.equal(find('tr.t-category-data').length, 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    visit(CATEGORY_NEW_URL);
    click('.t-cancel-btn');
    andThen(() => {
        assert.equal(store.find('category').get('length'), 0);
    });
});
