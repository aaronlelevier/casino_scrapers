import PageObject from 'bsrs-ember/tests/page-object';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import CD from 'bsrs-ember/vendor/defaults/category';
import { options, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { visitable, fillable, clickable, count, text, value } = PageObject;
const BASE_URL = BASEURLS.base_categories_url;
const DETAIL_URL = `${BASE_URL}/${CD.idOne}`;
const CATEGORY = '.t-category-children-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_TWO = `${CATEGORIES}:eq(1)`;
const CATEGORY_THREE = `${CATEGORIES}:eq(2)`;
const CATEGORY_DROPDOWN = multiple_options;

var CategoryPage = PageObject.create({
  visit: visitable('/'),
  visitDetail: visitable(DETAIL_URL),
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
  categoryClickOptionOneEq: clickable(`${options} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwoEq: clickable(`${options} > .ember-power-select-option:eq(1)`),
  categoryOptionLength: count(`${options} > li`),
  categoriesSelected: count(CATEGORIES),
});

export default CategoryPage;
