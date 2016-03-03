import Ember from 'ember';
import { test } from 'qunit';
import module from "bsrs-ember/tests/helpers/module";
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import config from 'bsrs-ember/config/environment';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import page from 'bsrs-ember/tests/pages/category';
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + UUID.value;
const CATEGORY_NEW_URL = BASE_URL + '/new/1';
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-category-children-select > .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.t-category-children-select-dropdown > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let application, store, payload, list_xhr, children_xhr, original_uuid, run = Ember.run;

module('Acceptance | category-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: CD.nameOne,
            description: CD.descriptionMaintenance,
            cost_amount: CD.costAmountOne,
            cost_code: CD.costCodeOne,
            label: CD.labelOne,
            subcategory_label: CD.subCatLabelTwo,
            parent: null,
            children: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, CF.empty());
        let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a&page_size=25';
        children_xhr = xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list());
        run(function() {
            store.push('category', {id: CD.idTwo+'2z', name: CD.nameOne+'2z'});//used for category selection to prevent fillIn helper firing more than once
        });
        original_uuid = random.uuid;
        random.uuid = function() { return UUID.value; };
    },
    afterEach() {
        payload = null;
        list_xhr = null;
        children_xhr = null;
        random.uuid = original_uuid;
        Ember.run(application, 'destroy');
    }
});

test('visiting /category/new', (assert) => {
    clearxhr(children_xhr);
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORIES_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        let category = store.find('category', UUID.value);
        assert.ok(category.get('new'));
        assert.equal(find('.t-new-category-name').text(), 'New Category');
    });
    //TODO: refactor using page object
    fillIn('.t-category-name', CD.nameOne);
    fillIn('.t-category-description', CD.descriptionMaintenance);
    fillIn('.t-category-label', CD.labelOne);
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    fillIn('.t-category-cost-code', CD.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        let category = store.find('category', UUID.value);
        assert.equal(category.get('new'), undefined);
        assert.equal(category.get('name'), CD.nameOne);
        assert.equal(category.get('description'), CD.descriptionMaintenance);
        assert.equal(category.get('label'), CD.labelOne);
        assert.equal(category.get('subcategory_label'), CD.subCatLabelTwo);
        assert.equal(category.get('cost_amount'), CD.costAmountOne);
        assert.equal(category.get('cost_code'), CD.costCodeOne);
        assert.ok(category.get('isNotDirty'));
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    clearxhr(children_xhr);
    let response = Ember.$.extend(true, {}, payload);
    let url = PREFIX + BASE_URL + '/';
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response );
    visit(CATEGORIES_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    fillIn('.t-category-description', CD.descriptionMaintenance);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    fillIn('.t-category-cost-code', CD.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    fillIn('.t-category-label', CD.labelOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
    });
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    fillIn('.t-category-name', CD.nameOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(children_xhr);
    clearxhr(list_xhr);
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CD.nameOne);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORY_NEW_URL);
            assert.equal(find('.t-modal').is(':visible'), true);
            assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
        });
    });
    click('.t-modal-footer .t-modal-cancel-btn');
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORY_NEW_URL);
            assert.equal(find('.t-category-name').val(), CD.nameOne);
            assert.equal(find('.t-modal').is(':hidden'), true);
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
    clearxhr(children_xhr);
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CD.nameOne);
    generalPage.cancel();
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
            let category = store.find('category', {id: UUID.value});
            assert.equal(category.get('length'), 0);
            assert.equal(find('tr.t-category-data').length, 0);
        });
    });
});

test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
    let categories;
    clearxhr(children_xhr);
    visit(CATEGORIES_URL);
    andThen(() => {
        categories = store.find('category').get('length');
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(store.find('category').get('length'), categories+1);

    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('category').get('length'), categories);
    });
});

/* CATEGORY TO CHILDREN */
test('clicking and typing into power select for categories children will fire off xhr request for all categories', (assert) => {
    let payload_new = Ember.$.extend(true, {}, payload);
    payload_new.children = [CD.idGridOne];
    let response = Ember.$.extend(true, {}, payload_new);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload_new), {}, 201, response);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        let category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.t-category-name', CD.nameOne);
    fillIn('.t-category-description', CD.descriptionMaintenance);
    fillIn('.t-category-label', CD.labelOne);
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    fillIn('.t-category-cost-code', CD.costCodeOne);
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, 'a');
    page.categoryClickOptionOneEq();
    andThen(() => {
        let category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 1);
        assert.equal(category.get('children').get('length'), 1);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('clicking and typing into power select for categories children will not filter if spacebar pressed', (assert) => {
    clearxhr(children_xhr);
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        let category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, ' ');
    andThen(() => {
        assert.equal(page.categoryOptionLength, 1);
    });
    andThen(() => {
        let category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
    });
    fillIn('.t-category-name', CD.nameOne);
    fillIn('.t-category-description', CD.descriptionMaintenance);
    fillIn('.t-category-label', CD.labelOne);
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    fillIn('.t-category-cost-code', CD.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('you can add and remove child from category', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        let category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.t-category-name', CD.nameOne);
    fillIn('.t-category-description', CD.descriptionMaintenance);
    fillIn('.t-category-label', CD.labelOne);
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    fillIn('.t-category-cost-code', CD.costCodeOne);
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, 'a');
    andThen(() => {
        assert.equal(page.categoryOptionLength, 10);
        const category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(category.get('children').get('length'), 0);
    });
    page.categoryClickOptionOneEq();
    andThen(() => {
        const category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 1);
        assert.equal(category.get('children').get('length'), 1);
    });
    page.categoryOneRemove();
    andThen(() => {
        const category = store.find('category', UUID.value);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(category.get('children').get('length'), 0);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('adding a new category should allow for another new category to be created after the first is persisted', (assert) => {
    clearxhr(children_xhr);
    let category_count;
    random.uuid = original_uuid;
    payload.id = 'abc123';
    patchRandomAsync(0);
    xhr(`${PREFIX}${BASE_URL}/`, 'POST', JSON.stringify(payload), {}, 201, Ember.$.extend(true, {}, payload));
    visit(CATEGORIES_URL);
    click('.t-add-new');
    fillIn('.t-category-name', CD.nameOne);
    fillIn('.t-category-description', CD.descriptionMaintenance);
    fillIn('.t-category-cost-code', CD.costCodeOne);
    fillIn('.t-category-label', CD.labelOne);
    fillIn('.t-category-subcategory-label', CD.subCatLabelTwo);
    fillIn('.t-amount', CD.costAmountOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        category_count = store.find('category').get('length');
    });
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.equal(store.find('category').get('length'), category_count + 1);
        assert.equal(find('.t-category-name').val(), '');
    });
});
