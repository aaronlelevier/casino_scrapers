import Ember from 'ember';
import { test, skip } from 'qunit';
import moduleForAcceptance from 'bsrs-ember/tests/helpers/module-for-acceptance';
import startApp from 'bsrs-ember/tests/helpers/start-app';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import {waitFor} from 'bsrs-ember/tests/helpers/utilities';
import UUID from 'bsrs-ember/vendor/defaults/uuid';
import GLOBALMSG from 'bsrs-ember/vendor/defaults/global-message';
import config from 'bsrs-ember/config/environment';
import CD from 'bsrs-ember/vendor/defaults/category';
import SCD from 'bsrs-ember/vendor/defaults/sccategory';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CURRENCY_DEFAULTS from 'bsrs-ember/vendor/defaults/currency';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import page from 'bsrs-ember/tests/pages/category';
import generalPage from 'bsrs-ember/tests/pages/general';
import personPage from 'bsrs-ember/tests/pages/person';
import rolePage from 'bsrs-ember/tests/pages/role';
import BASEURLS, { CATEGORIES_URL, SC_CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

const PREFIX = config.APP.NAMESPACE;
const PAGE_SIZE = config.APP.PAGE_SIZE;
const BASE_URL = BASEURLS.base_categories_url;
const CATEGORIES_INDEX_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + CD.idOne;
const DETAIL_URL_TWO = BASE_URL + '/' + CD.idTwo;
const GRID_DETAIL_URL = BASE_URL + '/' + CD.idGridOne;
const CATEGORY_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';
const CATEGORY_SEARCH = '.ember-power-select-trigger-multiple-input';

let detail_xhr, list_xhr, detail_data;

moduleForAcceptance('Acceptance | general category detail test', {
  beforeEach() {
    detail_data = CF.detail(CD.idOne);
    list_xhr = xhr(CATEGORIES_URL + '?page=1', 'GET', null, {}, 200, CF.list());
    detail_xhr = xhr(CATEGORIES_URL + CD.idOne + '/', 'GET', null, {}, 200, detail_data);
  },
});

test('clicking a categories name will redirect to the given detail view', function(assert) {
  clearxhr(detail_xhr);
  page.visit();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
    assert.equal(find('.t-nav-admin-category').hasClass('active'), true);
  });
  const detail_data = CF.detail(CD.idGridOne);
  xhr(CATEGORIES_URL + CD.idGridOne + '/', 'GET', null, {}, 200, detail_data);
  click('.t-grid-data:eq(0)');
  andThen(() => {
    assert.equal(currentURL(), GRID_DETAIL_URL);
    assert.equal(find('.t-nav-admin-category').hasClass('active'), true);
  });
});

test('when you deep link to the category detail view you get bound attrs', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(document.title,  t('doctitle.category.single', { name: 'Repair' }));
    let category = this.store.find('category', CD.idOne);
    assert.ok(category.get('isNotDirty'), 'is not dirty');
    assert.equal(page.nameInput, CD.nameOne);
    assert.equal(page.descriptionInput, CD.descriptionRepair);
    assert.equal(page.labelInput, CD.labelOne);
    assert.equal(page.amountInput, CD.costAmountOne);
    assert.equal(page.costCodeInput, CD.costCodeOne);
    assert.ok(page.scCategoryNameInput.includes(SCD.nameOne));
    assert.ok(page.parentNameInput.includes(CD.nameParent));
  });
  const search = 'a';
  // select sc category
  const sccategoryResponse = {
    results: [{
      id: SCD.idOne,
      name: SCD.nameOne
    },{
      id: SCD.idTwo,
      name: SCD.nameTwo
    }]
  };
  xhr(`${SC_CATEGORIES_URL}?sc_name__icontains=${search}`, 'GET', null, {}, 200, sccategoryResponse);
  selectSearch('.t-sc-category-name-select', search);
  selectChoose('.t-sc-category-name-select', SCD.nameTwo);
  andThen(() => {
    assert.ok(page.scCategoryNameInput.includes(SCD.nameTwo));
  });
  // select parent category
  const parentCategoryListData = CF.list_power_select();
  const parentId = parentCategoryListData.results[0].id;
  const parentName = parentCategoryListData.results[0].name;
  xhr(`${CATEGORIES_URL}?name__icontains=${search}`, 'GET', null, {}, 200, parentCategoryListData);
  selectSearch('.t-parent-select', search);
  selectChoose('.t-parent-select', parentName);
  andThen(() => {
    assert.ok(page.parentNameInput.includes(parentName));
  });
  // generate PUT
  let url = PREFIX + DETAIL_URL + '/';
  let response = CF.detail(CD.idOne);
  let payload = CF.put({
    id: CD.idOne,
    name: CD.nameTwo,
    description: CD.descriptionMaintenance,
    label: CD.labelTwo,
    cost_amount: CD.costAmountTwo,
    cost_code: CD.costCodeTwo,
    sc_category: SCD.idTwo,
    parent: parentId
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
    let category = this.store.find('category', CD.idOne);
    assert.ok(category.get('isDirty'), 'is dirty after fill in');
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
    const category = this.store.find('category', CD.idOne);
    assert.equal(category.get('name'), CD.nameTwo);
    assert.equal(category.get('description'), CD.descriptionMaintenance);
    assert.equal(category.get('label'), CD.labelTwo);
    assert.equal(category.get('cost_amount'), CD.costAmountTwo);
    assert.equal(category.get('cost_code'), CD.costCodeTwo);
    assert.ok(category.get('isNotDirty'), 'is not dirty last');
  });
});

test('when you click cancel, you are redirected to the category list view', function(assert) {
  page.visitDetail();
  andThen(() => {
    const category = this.store.find('category', CD.idOne);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
  });
  generalPage.cancel();
  andThen(() => {
    assert.equal(currentURL(), CATEGORIES_INDEX_URL);
  });
});

test('when editing the category name to invalid, it checks for validation', function(assert) {
  page.visitDetail();
  page.nameFill('');
  triggerEvent('.t-category-name', 'keyup', {keyCode: 32});
  andThen(() => {
    assert.equal($('.validated-input-error-dialog').length, 1);
    assert.equal($('.validated-input-error-dialog:eq(0)').text().trim(), t('errors.category.name'));
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

test('when user changes an attribute and clicks cancel, we prompt them with a modal and they hit cancel', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  page.nameFill(CD.nameTwo);
  generalPage.cancel();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL);
      assert.ok(generalPage.modalIsVisible, 'modal is visible');
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
      assert.equal(find('.t-category-name').val(), CD.nameTwo);
      assert.throws(Ember.$('.ember-modal-dialog'), 'modal dialog isnt there');
    });
  });
});

/* jshint ignore:start */
test('when click delete, modal displays and when click ok, category is deleted and removed from store', async function(assert) {
  await page.visitDetail();
  await generalPage.delete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), DETAIL_URL, 'at detail url');
      assert.ok(Ember.$('.ember-modal-dialog'), 'modal should show');
      assert.equal(Ember.$('.t-modal-title').text().trim(), t('crud.delete.title'), 'title shows');
      assert.equal(Ember.$('.t-modal-body').text().trim(), t('crud.delete.confirm', {module: 'category'}), 'body shows');
      assert.equal(Ember.$('.t-modal-delete-btn').text().trim(), t('crud.delete.button'), 'button shows');
    });
  });
  xhr(`${PREFIX}${BASE_URL}/${CD.idOne}/`, 'DELETE', null, {}, 204, {});
  generalPage.clickModalDelete();
  andThen(() => {
    waitFor(assert, () => {
      assert.equal(currentURL(), CATEGORIES_INDEX_URL, 'at index url');
      assert.equal(this.store.find('category', CD.idOne).get('length'), undefined, 'category removed from store');
      // assert.throws(Ember.$('.ember-modal-dialog'), 'should not be there');
    });
  });
});
/* jshint ignore:end */

test('cost_amount - is not required', function(assert) {
  page.visitDetail();
  page.nameFill(CD.nameOne);
  page.descriptionFill(CD.descriptionMaintenance);
  page.labelFill(CD.labelOne);
  page.amountFill('');
  andThen(() => {
    Ember.$('.t-amount').focusout();
  });
  andThen(() => {
    const category = this.store.find('category', CD.idOne);
    assert.equal(category.get('cost_amount'), null, 'cost amount is blank and set to null when clear out input');
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
test('clicking and typing into power select for categories children will fire off xhr request for all categories', function(assert) {
/* CATEGORY TO CHILDREN */
  page.visitDetail();
  andThen(() => {
    let category = this.store.find('category', CD.idOne);
    assert.deepEqual(category.get('children').objectAt(0).get('id'), CD.idChild);
    assert.equal(category.get('children').get('length'), 1);
  });
  let category_children_endpoint = `${CATEGORIES_URL}?search=a`;
  xhr(category_children_endpoint, 'GET', null, {}, 200, CF.list_power_select());
  selectSearch('.t-category-children-select', 'a');
  andThen(() => {
    assert.equal(page.categoryOptionLength, PAGE_SIZE);
  });
  page.categoryClickOptionOneEq();
  andThen(() => {
    let category = this.store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 2);
    assert.equal(page.categoriesSelected, 2);
  });
  page.categoryClickDropdown();
  fillIn(CATEGORY_SEARCH, '');
  andThen(() => {
    assert.equal(page.categoryOptionLength, 1);
    assert.equal(find(`${CATEGORY_DROPDOWN} > li:eq(0)`).text().trim(), GLOBALMSG.power_search);
    let category = this.store.find('category', CD.idOne);
    assert.ok(category.get('isDirtyOrRelatedDirty'), 'isDirtyOrRelatedDirty after changing children');
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

test('when you deep link to the category detail can remove child from category and add same one back', function(assert) {
  page.visitDetail();
  andThen(() => {
    let category = this.store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(page.categoriesSelected, 1);
  });
  page.categoryOneRemove();
  andThen(() => {
    let category = this.store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 0);
    assert.equal(page.categoriesSelected, 0);
  });
  let category_children_endpoint = `${CATEGORIES_URL}?search=a`;
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

// TODO: (Ember team) please delete if this isn't needed. This endpoint: `/api/admin/categories/category__icontains/...` has been deprecated
// test('starting with multiple categories, can remove all categories (while not populating options) and add back', function(assert) {
//     detail_data.children = [...detail_data.children, CF.get(CD.idThree)];
//     detail_data.children[1].name = CD.nameThree;
//     page.visitDetail();
//     andThen(() => {
//         let category = this.store.find('category', CD.idOne);
//         assert.equal(category.get('children').get('length'), 2);
//         assert.equal(page.categorySelected().indexOf(CD.nameTwo), 2);
//         assert.equal(page.categoryTwoSelected().indexOf(CD.nameThree), 2);
//     });
//     page.categoryOneRemove();
//     page.categoryOneRemove();
//     andThen(() => {
//         let category = this.store.find('category', CD.idOne);
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
//     //     let category = this.store.find('category', CD.idOne);
//     //     assert.equal(category.get('children').get('length'), 1);
//     //     assert.equal(page.categorySelected().indexOf(`${CD.nameTwo}`), 2);
//     //     assert.ok(category.get('isDirtyOrRelatedDirty'));
//     // });
//     // page.categoryClickDropdown();
//     // fillIn(CATEGORY_SEARCH, 'e');
//     // page.categoryClickOptionOneEq();
//     // andThen(() => {
//     //     let category = this.store.find('category', CD.idOne);
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

test('clicking and typing into power select for categories children will not filter if spacebar pressed', function(assert) {
  clearxhr(list_xhr);
  page.visitDetail();
  page.categoryClickDropdown();
  fillIn(`${CATEGORY_SEARCH}`, ' ');
  andThen(() => {
    assert.equal(page.categoryOptionLength, 1);
    assert.equal(find(CATEGORY_DROPDOWN).text().trim(), GLOBALMSG.power_search);
    let category = this.store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(page.categoryOptionLength, 1);
  });
});
/* END CATEGORY CHILDREN */

test('clicking cancel button will take from detail view to list view', function(assert) {
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

test('when user changes an attribute and clicks cancel we prompt them with a modal and they cancel', function(assert) {
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

test('when user changes an attribute and clicks cancel we prompt them with a modal and then roll back the model', function(assert) {
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
      let category = this.store.find('category', CD.idOne);
      assert.equal(category.get('name'), CD.nameOne);
      assert.equal(category.get('subcategory_label'), CD.subCatLabelOne);
    });
  });
});

skip('deep linking with an xhr with a 404 status code will show up in the error component (categories)', function(assert) {
  errorSetup();
  clearxhr(detail_xhr);
  clearxhr(list_xhr);
  const exception = `This record does not exist.`;
  xhr(`${CATEGORIES_URL}${CD.idOne}/`, 'GET', null, {}, 404, {'detail': exception});
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(find('.t-error-message').text(), 'WAT'); // uses `error` route/template
  });
  errorTearDown();
});

test('currency helper displays inherited cost_amount, and can click link-to to go to category inherited value', function(assert) {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  let detailData = CF.detail(CD.idTwo);
  detailData.cost_amount = undefined;
  xhr(CATEGORIES_URL + CD.idTwo + '/', 'GET', null, {}, 200, detailData);
  page.visitDetailTwo();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL_TWO);
    assert.equal(page.costAmountPlaceholder(), 'Default: ' + CD.costAmountOne);
    assert.equal(page.costAmountInheritedFromText, 'Inherited from: ' + TD.inherits_from_category);
    assert.equal(page.costAmountValue, '');
  });
  xhr(`${CATEGORIES_URL}${CD.idOne}/`, 'GET', null, {}, 200, CF.detail(CD.idOne));
  page.costAmountInheritedFromClick();
  andThen(() => {
    assert.equal(currentURL(), `${BASE_URL}/${CD.idOne}`);
  });
});

test('currency helper displays inherited sc_category_name, and can click link-to to go to category inherited value', function(assert) {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  let detailData = CF.detail(CD.idTwo);
  detailData.sc_category = undefined;
  xhr(CATEGORIES_URL + CD.idTwo + '/', 'GET', null, {}, 200, detailData);
  page.visitDetailTwo();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL_TWO);
    // TODO: remove when fix ember-power-select-mobile
    // assert.equal(page.scCategoryNamePlaceholder, CD.scCategoryNameOne);
    assert.equal(page.scCategoryNameInheritedFromText, 'Inherited from: ' + TD.inherits_from_category);
  });
  xhr(`${CATEGORIES_URL}${CD.idOne}/`, 'GET', null, {}, 200, CF.detail(CD.idOne));
  page.scCategoryNameInheritedFromClick();
  andThen(() => {
    assert.equal(currentURL(), `${BASE_URL}/${CD.idOne}`);
  });
});

test('currency helper displays inherited cost_code, and can click link-to to go to category inherited value', function(assert) {
  clearxhr(list_xhr);
  clearxhr(detail_xhr);
  let detailData = CF.detail(CD.idTwo);
  detailData.cost_code = undefined;
  xhr(CATEGORIES_URL + CD.idTwo + '/', 'GET', null, {}, 200, detailData);
  page.visitDetailTwo();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL_TWO);
    assert.equal(page.costCodePlaceholder(), 'Default: ' + CD.costCodeOne);
    assert.equal(page.costCodeInheritedFromText, 'Inherited from: ' + TD.inherits_from_category);
    assert.equal(page.costCodeInput, '');
  });
  xhr(`${CATEGORIES_URL}${CD.idOne}/`, 'GET', null, {}, 200, CF.detail(CD.idOne));
  page.costCodeInheritedFromClick();
  andThen(() => {
    assert.equal(currentURL(), `${BASE_URL}/${CD.idOne}`);
  });
});

test('click remove sc_category and will remove relationship', assert => {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.scCategoryNameInput, `${SCD.nameOne} ×`);
  });
  page.scCategoryNameClickRemove();
  andThen(() => {
    assert.equal(page.scCategoryNamePlaceholder, `${t('crud.default_value')}${CD.scCategoryNameOne}`);
  });
});

test('click remove parent and will remove relationship', assert => {
  clearxhr(list_xhr);
  page.visitDetail();
  andThen(() => {
    assert.equal(currentURL(), DETAIL_URL);
    assert.equal(page.parentNameInput, `${CD.nameParent} ×`);
  });
  page.parentNameClickRemove();
  andThen(() => {
    assert.equal(page.parentNameInput, t('power.select.select'));
  });
});
