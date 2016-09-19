import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import CD from 'bsrs-ember/vendor/defaults/category';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currencies';
import page from 'bsrs-ember/tests/pages/category';
import generalPage from 'bsrs-ember/tests/pages/general';
import personPage from 'bsrs-ember/tests/pages/person';
import rolePage from 'bsrs-ember/tests/pages/role';
import BASEURLS, { CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_INDEX_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + CD.idOne;
const GRID_DETAIL_URL = BASE_URL + '/' + CD.idGridOne;
const LETTER_A = {keyCode: 65};
const SPACEBAR = {keyCode: 32};
const CATEGORY = '.t-category-children-select .ember-basic-dropdown-trigger';
const CATEGORY_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let store, detail_xhr, list_xhr, detail_data;

moduleForAcceptance('Acceptance | category detail test', {
  beforeEach() {
    store = this.application.__container__.lookup('service:simpleStore');
    detail_data = CF.detail(CD.idOne);
    list_xhr = xhr(CATEGORIES_URL + '?page=1', 'GET', null, {}, 200, CF.list());
    detail_xhr = xhr(CATEGORIES_URL + CD.idOne + '/', 'GET', null, {}, 200, detail_data);
  },
});

test('clicking a categories name will redirect to the given detail view', (assert) => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
  const detail_data = CF.detail(CD.idGridOne);
  xhr(CATEGORIES_URL + CD.idGridOne + '/', 'GET', null, {}, 200, detail_data);
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), GRID_DETAIL_URL);
  });
});

test('when you deep link to the category detail view you get bound attrs', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    let category = store.find('category', CD.idOne);
    assert.ok(category.get('isNotDirty'));
    assert.equal(page.nameInput, CD.nameOne);
    assert.equal(page.descriptionInput, CD.descriptionRepair);
    assert.equal(page.labelInput, CD.labelOne);
    assert.equal(page.amountInput, CD.costAmountOne);
    assert.equal(page.costCodeInput, CD.costCodeOne);
  });
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({
    id: CD.idOne,
    name: CD.nameTwo,
    description: CD.descriptionMaintenance,
    label: CD.labelTwo,
    cost_amount: CD.costAmountTwo,
    cost_code: CD.costCodeTwo
  });
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  page.nameFill(CD.nameTwo);
  page.descriptionFill(CD.descriptionMaintenance);
  page.labelFill(CD.labelTwo);
  page.amountFill(CD.costAmountTwo);
  andThen(() => {
    $('.t-amount').focusout();
  });
  page.costCodeFill(CD.costCodeTwo);
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.ok(category.get('isDirty'));
  });
  let list = CF.list();
  list.results[0].name = CD.nameTwo;
  list.results[0].description = CD.descriptionMaintenance;
  list.results[0].label = CD.labelTwo;
  list.results[0].cost_amount = CD.costAmountTwo;
  list.results[0].cost_code = CD.costCodeTwo;
  //just leaving here until I can figure out how to do destructuring w/o jshint blowing up on me.
  // let results = list.results[0];
  // ({nameTwo: results.name, descriptionMaintenance: results.description, labelTwo: results.label, costAmountTwo: results.cost_amount, costCodeTwo: results.cost_code} = CD);
  xhr(CATEGORIES_URL + '?page=1', 'GET', null, {}, 200, list);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
    const category = store.find('category', CD.idOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('description'), CD.descriptionMaintenance);
    assert.equal(category.get('label'), CD.labelTwo);
    assert.equal(category.get('cost_amount'), CD.costAmountTwo);
    assert.equal(category.get('cost_code'), CD.costCodeTwo);
    assert.ok(category.get('isNotDirty'));
  });
});

test('when you click cancel, you are redirected to the category list view', (assert) => {
  page.visitDetail();
  andThen(() => {
    const category = store.find('category', CD.idOne);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

test('when editing the category name to invalid, it checks for validation', (assert) => {
  page.visitDetail();
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
    assert.notOk(page.nameValidationErrorVisible);
  });
  page.nameFill('');
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), 'errors.category.name');
    assert.ok(page.nameValidationErrorVisible);
  });
  page.nameFill(CD.nameTwo);
  triggerEvent('.t-category-name', 'keyup', {keyCode: 65});
  page.descriptionFill(CD.descriptionRepair);
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 0);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), '');
    assert.notOk(page.nameValidationErrorVisible);
  });
  const url = PREFIX + DETAIL_URL + "/";
  const response = CF.detail(CD.idOne);
  const payload = CF.put({id: CD.idOne, name: CD.nameTwo});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  page.nameFill(CD.nameTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      // assert.ok(generalPage.modalIsVisible, 'modal is visible');
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.discard_changes'), 'text for title');
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'), 'text for body');
      assert.equal(Ember.$('.t-modal-rollback-btn').text().trim(), t('crud.yes'), 'rollback btn');
      assert.equal(Ember.$('.t-modal-cancel-btn').text().trim(), t('crud.no'), 'cancel btn');
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      // assert.equal(find('.t-category-name').val(), CD.nameTwo);
      assert.throws(Ember.$('.ember-modal-dialog'), 'modal dialog isnt there');
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, category is deleted and removed from store', async assert => {
  await page.visitDetail();
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(Ember.$('.ember-modal-dialog'));
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'));
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'category'}));
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'));
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${CD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), CATEGORIES_INDEX_URL);
      assert.equal(store.find('category', CD.idOne).get('length'), undefined);
      assert.throws(Ember.$('.ember-modal-dialog'));
    });
  });
});
/* jshint ignore:end */

test('cost_amount - is not required', (assert) => {
  page.visitDetail();
  page.nameFill(CD.nameOne);
  page.descriptionFill(CD.descriptionMaintenance);
  page.labelFill(CD.labelOne);
  page.amountFill('');
  andThen(() => {
    $('.t-amount').focusout();
  });
  andThen(() => {
    const category = store.find('category', CD.idOne);
    assert.equal(category.get('cost_amount'), '');
  });
  page.costCodeFill(CD.costCodeOne);
  page.subLabelFill(CD.subCatLabelTwo);
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({id: CD.idOne, name: CD.nameOne, description: CD.descriptionMaintenance,
                     label: CD.labelOne, subcategory_label: CD.subCatLabelTwo, cost_amount: null, cost_code: CD.costCodeOne});
                     xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

/* CATEGORY TO CHILDREN */
test('clicking and typing into power select for categories children will fire off xhr request for all categories', (assert) => {
  page.visitDetail();
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.deepEqual(category.get('children').objectAt(0).get('id'), CD.idChild);
    assert.equal(category.get('children').get('length'), 1);
  });
  let category_children_endpoint = `${CATEGORIES_URL}category__icontains=a/`;
  xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list_power_select());
  selectSearch('.t-category-children-select', 'a');
  andThen(() => {
    assert.equal(page.categoryOptionLength, PAGE_SIZE);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 2);
    assert.equal(page.categoriesSelected, 2);
  });
  page.categoryClickDropdown();
  fillIn(CATEGORY_SEARCH, '');
  andThen(() => {
    assert.equal(page.categoryOptionLength, 1);
    assert.equal(find(`${CATEGORY_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
    let category = store.find('category', CD.idOne);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
  });
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({id: CD.idOne, children: [CD.idChild, CD.idGridOne]});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

test('when you deep link to the category detail can remove child from category and add same one back', (assert) => {
  page.visitDetail();
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(page.categoriesSelected, 1);
  });
  page.categoryOneRemove();
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 0);
    assert.equal(page.categoriesSelected, 0);
  });
  let category_children_endpoint = `${CATEGORIES_URL}category__icontains=a/`;
  xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list_power_select());
  selectSearch('.t-category-children-select', 'a');
  page.categoryClickOptionOneEq();
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({id: CD.idOne, children: [CD.idGridOne]});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

// test('starting with multiple categories, can remove all categories (while not populating options) and add back', (assert) => {
//     detail_data.children = [...detail_data.children, CF.get(CD.idThree)];
//     detail_data.children[1].name = CD.nameThree;
//     page.visitDetail();
//     andThen(() => {
//         let category = store.find('category', CD.idOne);
//         assert.equal(category.get('children').get('length'), 2);
//         assert.equal(page.categorySelected().indexOf(CD.nameTwo), 2);
//         assert.equal(page.categoryTwoSelected().indexOf(CD.nameThree), 2);
//     });
//     page.categoryOneRemove();
//     page.categoryOneRemove();
//     andThen(() => {
//         let category = store.find('category', CD.idOne);
//         assert.equal(category.get('children').get('length'), 0);
//         assert.ok(category.get('isDirtyOrRelatedDirty'));
//     });
//     // let category_children_endpoint = `${CATEGORIES_URL}category__icontains=e&page_size=25`;
//     // const payload_cats = CF.list_power_select();
//     // payload_cats.results.unshift(CF.get(CD.idTwo, CD.nameTwo));
//     // payload_cats.results.unshift(CF.get(CD.idThree, CD.nameThree));
//     // xhr(category_children_endpoint, 'GET', null, {}, 200, payload_cats);
//     // page.categoryClickDropdown();
//     // fillIn(CATEGORY_SEARCH, 'e');
//     // page.categoryClickOptionTwoEq();
//     // andThen(() => {
//     //     let category = store.find('category', CD.idOne);
//     //     assert.equal(category.get('children').get('length'), 1);
//     //     assert.equal(page.categorySelected().indexOf(`${CD.nameTwo}`), 2);
//     //     assert.ok(category.get('isDirtyOrRelatedDirty'));
//     // });
//     // page.categoryClickDropdown();
//     // fillIn(CATEGORY_SEARCH, 'e');
//     // page.categoryClickOptionOneEq();
//     // andThen(() => {
//     //     let category = store.find('category', CD.idOne);
//     //     assert.equal(category.get('children').get('length'), 2);
//     //     //TODO: implement attrs for category
//     //     // assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
//     // });
//     // let url = PREFIX + DETAIL_URL + "/";
//     // let payload = CF.put({id: CD.idOne, children: [CD.idTwo, CD.idThree]});
//     // xhr(url, 'PUT', JSON.stringify(payload), {}, 200);
//     // generalPage.save();
//     // andThen(() => {
//     //     assert.equal(currentURL(), CATEGORIES_INDEX_URL);
//     // });
// });

test('clicking and typing into power select for categories children will not filter if spacebar pressed', (assert) => {
  page.visitDetail();
  andThen(() => {
    let category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
  });
  page.categoryClickDropdown();
  fillIn(`${CATEGORY_SEARCH}`, ' ');
  andThen(() => {
    assert.equal(page.categoryOptionLength, 1);
    assert.equal(find(CATEGORY_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    let category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(page.categoryOptionLength, 1);
  });
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({id: CD.idOne, children: [CD.idChild]});
  xhr(url, 'PUT', JSON.stringify(payload), {}, 200, response);
  generalPage.save();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});
/* END CATEGORY CHILDREN */

test('clicking cancel button will take from detail view to list view', (assert) => {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
  const detail_data = CF.detail(CD.idGridOne);
  xhr(CATEGORIES_URL + CD.idGridOne + '/', 'GET', null, {}, 200, detail_data);
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), GRID_DETAIL_URL);
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', (assert) => {
  clearxhr(list_xhr);
  page.visitDetail();
  page.nameFill(CD.nameTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
      assert.equal(find('.t-modal-body').text().trim(), t('crud.discard_changes_confirm'));
    });
  });
  generalPage.clickModalCancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.equal(find('.t-category-name').val(), CD.nameTwo);
      assert.ok(generalPage.modalIsHidden);
    });
  });
});

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', (assert) => {
  page.visitDetail();
  page.nameFill(CD.nameTwo);
  page.subLabelFill(CD.subCatLabelOne);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible);
    });
  });
  generalPage.clickModalRollback();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), CATEGORIES_INDEX_URL);
      let category = store.find('category', CD.idOne);
      assert.equal(category.get('name'), CD.nameOne);
      assert.equal(category.get('subcategory_label'), CD.subCatLabelOne);
    });
  });
});

test('deep linking with an xhr with a 404 status code will show up in the error component (categories)', (assert) => {
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${CATEGORIES_URL}${CD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT');
  });
});
