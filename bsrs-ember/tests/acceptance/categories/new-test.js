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

let application, store, payload, detail_xhr;

module('sco Acceptance | category-new', {
    beforeEach() {
        payload = {
            id: UUID.value,
            name: CATEGORY_DEFAULTS.nameOne,
            description: CATEGORY_DEFAULTS.descriptionMaintenance,
        };
        application = startApp();
        store = application.__container__.lookup('store:main');
        let endpoint = PREFIX + CATEGORIES_URL + "/";
        xhr(endpoint, "GET", null, {}, 200, CATEGORY_FIXTURES.empty());
    },
    afterEach() {
        payload = null;
        Ember.run(application, 'destroy');
        detail_xhr = null;
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
    click(SAVE_BTN);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category').get('length'), 1);
        let category = store.find('category').objectAt(0);
        assert.equal(category.get('id'), UUID.value);
        assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameOne);
        assert.equal(category.get('description'), CATEGORY_DEFAULTS.descriptionMaintenance);
        assert.ok(category.get('isNotDirty'));
    });
});

// test('validation works and when hit save, we do same post', (assert) => {
//     let response = Ember.$.extend(true, {}, payload);
//     let url = PREFIX + CATEGORIES_URL + '/';
//     xhr( url,'POST',JSON.stringify(payload),{},201,response );
//     visit(BASE_CATEGORIES_URL);
//     click('.t-category-new');
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//         assert.ok(find('.t-password-validation-error').is(':hidden'));
//     });
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.ok(find('.t-name-validation-error').is(':visible'));
//         assert.ok(find('.t-password-validation-error').is(':visible'));
//     });
//     fillIn('.t-category-name', CATEGORY_DEFAULTS.name);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), CATEGORY_NEW_URL);
//         assert.ok(find('.t-name-validation-error').is(':hidden'));
//     });
//     fillIn('.t-category-password', CATEGORY_DEFAULTS.password);
//     fillIn('.t-category-role-select', CATEGORY_DEFAULTS.role);
//     click(SAVE_BTN);
//     andThen(() => {
//         assert.equal(currentURL(), DETAIL_URL);
//     });
// });

// test('when user clicks cancel we prompt them with a modal and they cancel to keep model data', (assert) => {
//     clearxhr(detail_xhr);
//     visit(CATEGORY_NEW_URL);
//     fillIn('.t-category-name', CATEGORY_DEFAULTS.name);
//     click('.t-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), CATEGORY_NEW_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//             assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
//         });
//     });
//     click('.t-modal-footer .t-modal-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), CATEGORY_NEW_URL);
//             assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.name);
//             assert.equal(find('.t-modal').is(':hidden'), true);
//         });
//     });
// });

// test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back model to remove from store', (assert) => {
//     clearxhr(detail_xhr);
//     visit(CATEGORY_NEW_URL);
//     fillIn('.t-category-name', CATEGORY_DEFAULTS.name);
//     click('.t-cancel-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), CATEGORY_NEW_URL);
//             assert.equal(find('.t-modal').is(':visible'), true);
//             let category = store.find('category', {id: UUID.value});
//             assert.equal(category.get('length'), 1);
//         });
//     });
//     click('.t-modal-footer .t-modal-rollback-btn');
//     andThen(() => {
//         waitFor(() => {
//             assert.equal(currentURL(), CATEGORIES_URL);
//             assert.equal(find('.t-modal').is(':hidden'), true);
//             let category = store.find('category', {id: UUID.value});
//             assert.equal(category.get('length'), 0);
//             assert.equal(find('tr.t-category-data').length, 0);
//         });
//     });
// });

// test('when user enters new form and doesnt enter data, the record is correctly removed from the store', (assert) => {
//     clearxhr(detail_xhr);
//     visit(CATEGORY_NEW_URL);
//     click('.t-cancel-btn');
//     andThen(() => {
//         assert.equal(store.find('category').get('length'), 0);
//     });
// });

