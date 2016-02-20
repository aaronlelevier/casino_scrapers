import PageObject from '../page-object';
import CD from 'bsrs-ember/vendor/defaults/category';

let { visitable, fillable, clickable, count, text } = PageObject;
const CATEGORY = '.t-category-children-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_TWO = `${CATEGORIES}:eq(1)`;
const CATEGORY_THREE = `${CATEGORIES}:eq(2)`;
const CATEGORY_DROPDOWN = '.t-category-children-select-dropdown > .ember-power-select-options';

var CategoryPage = PageObject.create({
  visit: visitable('/'),
  nameFill: fillable('.t-category-name'),
  nameInput: PageObject.value('.t-category-name'),
  descriptionFill: fillable('.t-category-description'),
  descriptionInput: PageObject.value('.t-category-description'),
  amountFill: fillable('.t-amount'),
  amountInput: PageObject.value('.t-amount'),
  costCodeFill: fillable('.t-category-cost-code'),
  costCodeInput: PageObject.value('.t-category-cost-code'),
  labelFill: fillable('.t-category-label'),
  labelInput: PageObject.value('.t-category-label'),
  subLabelFill: fillable('.t-category-subcategory-label'),
  clickSelectizeOption: clickable('.t-category-children-select div.option:eq(0)'), 
  categoryClickDropdown: clickable(`${CATEGORY}`),
  categorySelected: text(`${CATEGORY_ONE}`),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  categoryTwoSelected: text(`${CATEGORY_TWO}`),
  categoryClickOptionOneEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwoEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(1)`),
  categoryOptionLength: count(`${CATEGORY_DROPDOWN} > li`),
  categoriesSelected: count(`${CATEGORIES}`),
});

export default CategoryPage;
