import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import BASEURLS from 'bsrs-ember/utilities/urls';
import CD from 'bsrs-ember/vendor/defaults/category';
let { visitable, fillable, clickable, count, text, value, hasClass } = PageObject;
import { POWER_SELECT_OPTIONS, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';


const BASE_URL = BASEURLS.base_categories_url;
const INDEX_URL = BASEURLS.base_categories_url + '/index';
const DETAIL_URL = `${BASE_URL}/${CD.idOne}`;
const DETAIL_URL_TWO = `${BASE_URL}/${CD.idTwo}`;
const CATEGORY_NEW_URL = BASE_URL + '/new/1';
const CATEGORY = '.t-category-children-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_TWO = `${CATEGORIES}:eq(1)`;
const CATEGORY_THREE = `${CATEGORIES}:eq(2)`;
const CATEGORY_DROPDOWN = multiple_options;
const SC_CATEGORY_NAME = '.t-sc-category-name-select .ember-basic-dropdown-trigger';
const SC_CATEGORY_NAME_PLACEHOLDER = '.t-sc-category-name-select .ember-power-select-placeholder';

const PARENT_NAME = '.t-parent-select .ember-basic-dropdown-trigger';


var CategoryPage = PageObject.create({
  visit: visitable(INDEX_URL),
  visitDetail: visitable(DETAIL_URL),
  visitDetailTwo: visitable(DETAIL_URL_TWO),
  visitNew: visitable(CATEGORY_NEW_URL),
  nameFill: fillable('.t-category-name'),
  nameInput: value('.t-category-name'),
  descriptionFill: fillable('.t-category-description'),
  descriptionInput: PageObject.value('.t-category-description'),
  amountFill: fillable('.t-amount'),
  amountInput: PageObject.value('.t-amount'),
  costCodeFill: fillable('.t-category-cost-code'),
  costCodeInput: PageObject.value('.t-category-cost-code'),
  labelFill: fillable('.t-category-label'),
  labelInput: PageObject.value('.t-category-label'),
  subLabelFill: fillable('.t-category-subcategory-label'),
  categoryClickDropdown: clickable(CATEGORY),
  categorySelected: text(`${CATEGORY_ONE}`),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  categoryTwoSelected: text(`${CATEGORY_TWO}`),
  categoryClickOptionOneEq: clickable(`${POWER_SELECT_OPTIONS} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwoEq: clickable(`${POWER_SELECT_OPTIONS} > .ember-power-select-option:eq(1)`),
  categoryOptionLength: count(`${POWER_SELECT_OPTIONS} > li`),
  categoriesSelected: count(CATEGORIES),

  parentNameInput: text(PARENT_NAME),
  parentNameClickRemove: clickable(`${PARENT_NAME} .ember-power-select-clear-btn`),

  costAmountInheritedFromText: text('.t-inherited-msg-cost_amount'),
  costAmountPlaceholder: () => Ember.$('.t-amount').get(0)['placeholder'],
  costAmountValue: value('.t-amount'),
  costAmountInheritedFromClick: clickable('.t-inherited-msg-cost_amount-link'),

  scCategoryNameInput: text(SC_CATEGORY_NAME),
  scCategoryNamePlaceholder: text(SC_CATEGORY_NAME_PLACEHOLDER),
  scCategoryNameInheritedFromText: text('.t-inherited-msg-sc_category_name'),
  scCategoryNameInheritedFromClick: clickable('.t-inherited-msg-sc_category_name-link'),
  scCategoryNameClickRemove: clickable(`${SC_CATEGORY_NAME} .ember-power-select-clear-btn`),

  costCodePlaceholder: () => Ember.$('.t-category-cost-code').get(0)['placeholder'],
  costCodeInheritedFromText: text('.t-inherited-msg-cost_code'),
  costCodeInheritedFromClick: clickable('.t-inherited-msg-cost_code-link'),

  //validation
  nameValidationErrorVisible: hasClass('invalid', '.t-category-name-validator'),
});

export default CategoryPage;
