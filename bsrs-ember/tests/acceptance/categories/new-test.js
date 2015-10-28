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
import generalPage from 'bsrs-ember/tests/pages/general';
import random from 'bsrs-ember/models/random';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + UUID.value;
const CATEGORY_NEW_URL = BASE_URL + '/new';
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};

let application, store, payload, list_xhr, children_xhr, original_uuid;

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
            parent: null,
            children: []
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, CATEGORY_FIXTURES.empty());
        let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a';
        children_xhr = xhr(category_children_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
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
        assert.equal(store.find('category').get('length'), 4);
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        let category = store.find('category', UUID.value);
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
    clearxhr(children_xhr);
    let response = Ember.$.extend(true, {}, payload);
    let url = PREFIX + BASE_URL + '/';
    xhr(url, 'POST', JSON.stringify(payload), {}, 201, response );
    visit(CATEGORIES_URL);
    click('.t-add-new');
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORY_NEW_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    generalPage.save();
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
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
    clearxhr(children_xhr);
    clearxhr(list_xhr);
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    generalPage.cancel();
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
    clearxhr(children_xhr);
    visit(CATEGORY_NEW_URL);
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
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
    clearxhr(children_xhr);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        assert.equal(store.find('category').get('length'), 4);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(store.find('category').get('length'), 3);
    });
});

test('when you deep link to the category detail can remove child from category', (assert) => {
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idNew);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    fillIn('.selectize-input input', 'a');
    triggerEvent('.selectize-input input', 'keyup', LETTER_A);
    click('.t-category-children-select div.option:eq(0)');
    click('div.item > a.remove:eq(0)');
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idNew);
        assert.equal(category.get('children_fks').get('length'), 0);
        assert.equal(find('div.option').length, 3);
        assert.equal(find('div.item').length, 0);
    });
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('clicking and typing into selectize for categories children will not filter if spacebar pressed', (assert) => {
    clearxhr(children_xhr);
    let response = Ember.$.extend(true, {}, payload);
    xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload), {}, 201, response);
    visit(CATEGORY_NEW_URL);
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idNew);
        assert.equal(category.get('children').get('length'), 0);
        assert.equal(find('div.item').length, 0);
        assert.equal(find('div.option').length, 0);
    });
    fillIn('.selectize-input input', ' ');
    triggerEvent('.selectize-input input', 'keyup', SPACEBAR);
    andThen(() => {
        assert.equal(find('div.option').length, 0);
    });
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idNew);
        assert.equal(category.get('children_fks').get('length'), 0);
        // assert.equal(find('div.item').length, 1);//firefox clears out input?
    });
    fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
    fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
    fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
    fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
    fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
    fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

// //TODO: figure out why has to be last test...leeky vars cause previous two tests to have children in payload
// test('clicking and typing into selectize for categories children will fire off xhr request for all categories', (assert) => {
//     let payload_new = Ember.$.extend(true, {}, payload);
//     payload_new.children = [CATEGORY_DEFAULTS.idOne];
//     let response = Ember.$.extend(true, {}, payload_new);
//     xhr(PREFIX + BASE_URL + '/', 'POST', JSON.stringify(payload_new), {}, 201, response);
//     visit(CATEGORY_NEW_URL);
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idNew);
//         assert.equal(category.get('children').get('length'), 0);
//         assert.equal(find('div.item').length, 0);
//         assert.equal(find('div.option').length, 0);
//     });
//     fillIn('.t-category-name', CATEGORY_DEFAULTS.nameOne);
//     fillIn('.t-category-description', CATEGORY_DEFAULTS.descriptionMaintenance);
//     fillIn('.t-category-label', CATEGORY_DEFAULTS.labelOne);
//     fillIn('.t-category-subcategory-label', CATEGORY_DEFAULTS.subCatLabelTwo);
//     fillIn('.t-amount', CATEGORY_DEFAULTS.costAmountOne);
//     fillIn('.t-category-cost-code', CATEGORY_DEFAULTS.costCodeOne);
//     fillIn('.selectize-input input', 'a');
//     triggerEvent('.selectize-input input', 'keyup', LETTER_A);
//     click('.t-category-children-select div.option:eq(0)');
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idNew);
//         assert.equal(category.get('children_fks').get('length'), 1);
//         assert.equal(find('div.option').length, 2);
//         assert.equal(find('div.item').length, 1);
//     });
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), CATEGORIES_URL);
//     });
// });
