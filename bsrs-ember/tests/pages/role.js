import PageObject from '../page-object';
import CD from 'bsrs-ember/vendor/defaults/category';

let { visitable, fillable, clickable, count } = PageObject;
const CATEGORY = '.t-role-category-select > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_TWO = `${CATEGORIES}:eq(1)`;
const CATEGORY_THREE = `${CATEGORIES}:eq(2)`;
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visit: visitable('/'),
  categoryClickDropdown: clickable(`${CATEGORY}`),
  // categoryInput: text(`${CATEGORY}`),
  // categorySelected: text(`${CATEGORY_ONE}`),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  // categoryTwoRemove: clickable(`${CATEGORY_TWO} > .ember-power-select-multiple-remove-btn`),
  // categoryTwoSelected: text(`${CATEGORY_TWO}`),
  // categoryThreeSelected: text(`${CATEGORY_THREE}`),
  categoryClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(${CD.nameOne}1)`),
  categoryClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne}2)`),
  categoryClickOptionThree: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne}3)`),
  categoryClickOptionScooter: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains('scooter')`),
  categoryOptionLength: count(`${CATEGORY_DROPDOWN} > li`),
  categoriesSelected: count(`${CATEGORIES}`),
});
