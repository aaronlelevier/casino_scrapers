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
import generalPage from 'bsrs-ember/tests/pages/general';
import page from 'bsrs-ember/tests/pages/category';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + CATEGORY_DEFAULTS.idOne;
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-category-children-select > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_DROPDOWN = '.t-category-children-select-dropdown > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let application, store, endpoint, list_xhr;

module('Acceptance | detail test', {
    beforeEach() {
        application = startApp();
        store = application.__container__.lookup('store:main');
        endpoint = PREFIX + BASE_URL + '/';
        list_xhr = xhr(endpoint + '?page=1', 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
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
    click('.t-grid-data:eq(0)');
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
        assert.equal(page.nameInput(), CATEGORY_DEFAULTS.nameOne);
        assert.equal(page.descriptionInput(), CATEGORY_DEFAULTS.descriptionRepair);
        assert.equal(page.labelInput(), CATEGORY_DEFAULTS.labelOne);
        assert.equal(page.amountInput(), CATEGORY_DEFAULTS.costAmountOne);
        assert.equal(page.costCodeInput(), CATEGORY_DEFAULTS.costCodeOne);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameTwo, description: CATEGORY_DEFAULTS.descriptionMaintenance, 
    label: CATEGORY_DEFAULTS.labelTwo, cost_amount: CATEGORY_DEFAULTS.costAmountTwo, cost_code: CATEGORY_DEFAULTS.costCodeTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    page.nameFill(CATEGORY_DEFAULTS.nameTwo);
    page.descriptionFill(CATEGORY_DEFAULTS.descriptionMaintenance);
    page.labelFill(CATEGORY_DEFAULTS.labelTwo);
    page.amountFill(CATEGORY_DEFAULTS.costAmountTwo);
    page.costCodeFill(CATEGORY_DEFAULTS.costCodeTwo);
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
    xhr(endpoint + '?page=1', 'GET', null, {}, 200, list);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category').get('length'), 10);
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
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when editing the category name to invalid, it checks for validation', (assert) => {
    visit(DETAIL_URL);
    page.nameFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-name-validation-error').text().trim(), 'invalid name');
    });
    page.descriptionFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.equal(find('.t-description-validation-error').text().trim(), 'Invalid Description');
    });
    page.nameFill(CATEGORY_DEFAULTS.nameTwo);
    page.descriptionFill(CATEGORY_DEFAULTS.descriptionRepair);
    let url = PREFIX + DETAIL_URL + "/";
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameTwo});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    page.nameFill(CATEGORY_DEFAULTS.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), GLOBALMSG.modal_unsaved_msg);
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when click delete, category is deleted and removed from store', (assert) => {
    visit(DETAIL_URL);
    xhr(PREFIX + BASE_URL + '/' + CATEGORY_DEFAULTS.idOne + '/', 'DELETE', null, {}, 204, {});
    generalPage.delete();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
        assert.equal(store.find('category', CATEGORY_DEFAULTS.idOne).get('length'), undefined);
    });
});

test('validation works and when hit save, we do same post', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':hidden'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    page.nameFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':hidden'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    page.descriptionFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':hidden'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    page.costCodeFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':hidden'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    page.labelFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':hidden'));
    });
    page.subLabelFill('');
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), DETAIL_URL);
        assert.ok(find('.t-name-validation-error').is(':visible'));
        assert.ok(find('.t-description-validation-error').is(':visible'));
        assert.ok(find('.t-cost-code-validation-error').is(':visible'));
        assert.ok(find('.t-label-validation-error').is(':visible'));
        assert.ok(find('.t-subcategory-label-validation-error').is(':visible'));
    });
    page.nameFill(CATEGORY_DEFAULTS.nameOne);
    page.descriptionFill(CATEGORY_DEFAULTS.descriptionMaintenance);
    page.labelFill(CATEGORY_DEFAULTS.labelOne);
    page.costCodeFill(CATEGORY_DEFAULTS.costCodeOne);
    page.subLabelFill(CATEGORY_DEFAULTS.subCatLabelTwo);
    let url = PREFIX + DETAIL_URL + '/';
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionMaintenance, 
    label: CATEGORY_DEFAULTS.labelOne, subcategory_label: CATEGORY_DEFAULTS.subCatLabelTwo, cost_amount: CATEGORY_DEFAULTS.costAmountOne, cost_code: CATEGORY_DEFAULTS.costCodeOne});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('clicking and typing into power select for categories children will fire off xhr request for all categories', (assert) => {
    visit(DETAIL_URL);
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('children_fks').length, 1);
        assert.equal(category.get('children').get('length'), 1);
        assert.equal(find('div.option').length, 0);
    });
    let category_children_endpoint = PREFIX + '/admin/categories/' + '?name__icontains=a';
    xhr(category_children_endpoint, 'GET', null, {}, 200, CATEGORY_FIXTURES.list());
    page.categoryClickDropdown();
    fillIn(`${CATEGORY_SEARCH}`, 'a');
    page.categoryClickOptionThree();
    andThen(() => {
        let category = store.find('category', CATEGORY_DEFAULTS.idOne);
        assert.equal(category.get('children_fks').get('length'), 2);
        assert.equal(page.categoriesSelected(), 2);
    });
    let url = PREFIX + DETAIL_URL + '/';
    let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
    let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, children: [CATEGORY_DEFAULTS.idChild, CATEGORY_DEFAULTS.idThree]});
    xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
    generalPage.save();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

// //TODO: seems like performance issue with firefox; other tests have no problems
// test('when you deep link to the category detail can remove child from category', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idOne);
//         assert.equal(category.get('children_fks').length, 1);
//         assert.equal(category.get('children').get('length'), 1);
//         // assert.equal(find('div.item').length, 1);
//         assert.equal(find('div.option').length, 0);
//     });
//     click('div.item > a.remove:eq(0)');
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idOne);
//         assert.equal(category.get('children_fks').get('length'), 0);
//         assert.equal(find('div.option').length, 1);
//         assert.equal(find('div.item').length, 0);
//     });
//     let url = PREFIX + DETAIL_URL + '/';
//     let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
//     let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, children: []});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), CATEGORIES_URL);
//     });
// });

// test('brokensco clicking and typing into selectize for categories children will not filter if spacebar pressed', (assert) => {
//     visit(DETAIL_URL);
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idOne);
//         assert.equal(category.get('children_fks').length, 1);
//         assert.equal(category.get('children').get('length'), 1);
//         // assert.equal(find('div.item').length, 1);
//         assert.equal(find('div.option').length, 0);
//     });
//     selectize.input(' ');
//     triggerEvent('.selectize-input input', 'keyup', SPACEBAR);
//     andThen(() => {
//         assert.equal(find('div.option').length, 0);
//     });
//     andThen(() => {
//         let category = store.find('category', CATEGORY_DEFAULTS.idOne);
//         assert.equal(category.get('children_fks').get('length'), 1);
//         // assert.equal(find('div.item').length, 1);//firefox clears out input?
//     });
//     let url = PREFIX + DETAIL_URL + '/';
//     let response = CATEGORY_FIXTURES.detail(CATEGORY_DEFAULTS.idOne);
//     let payload = CATEGORY_FIXTURES.put({id: CATEGORY_DEFAULTS.idOne, children: [CATEGORY_DEFAULTS.idChild]});
//     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
//     generalPage.save();
//     andThen(() => {
//         assert.equal(currentURL(), CATEGORIES_URL);
//     });
// });

test('clicking cancel button will take from detail view to list view', (assert) => {
    visit(CATEGORIES_URL);
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
    click('.t-grid-data:eq(0)');
    andThen(() => {
        assert.equal(currentURL(),DETAIL_URL);
    });
    generalPage.cancel();
    andThen(() => {
        assert.equal(currentURL(), CATEGORIES_URL);
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
    clearxhr(list_xhr);
    visit(DETAIL_URL);
    page.nameFill(CATEGORY_DEFAULTS.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
            assert.equal(find('.t-modal-body').text().trim(), 'You have unsaved changes. Are you sure?');
        });
    });
    generalPage.clickModalCancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.equal(find('.t-category-name').val(), CATEGORY_DEFAULTS.nameTwo);
            assert.ok(generalPage.modalIsHidden());
        });
    });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
    visit(DETAIL_URL);
    page.nameFill(CATEGORY_DEFAULTS.nameTwo);
    generalPage.cancel();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), DETAIL_URL);
            assert.ok(generalPage.modalIsVisible());
        });
    });
    generalPage.clickModalRollback();
    andThen(() => {
        waitFor(() => {
            assert.equal(currentURL(), CATEGORIES_URL);
            let category = store.find('category', CATEGORY_DEFAULTS.idOne);
            assert.equal(category.get('name'), CATEGORY_DEFAULTS.nameOne + '1');
        });
    });
});
