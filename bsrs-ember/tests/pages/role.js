import PageObject from '../page-object';
import CD from 'bsrs-ember/vendor/defaults/category';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

let { text, visitable, fillable, clickable, count } = PageObject;
const ROLETYPE = '.t-role-role-type > .ember-basic-dropdown-trigger';
const ROLETYPE_DROPDOWN = '.t-role-role-type-dropdown > .ember-power-select-options';
const LOCATIONLEVEL = '.t-location-level-select > .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = '.t-location-level-select-dropdown > .ember-power-select-options';
const CATEGORY = '.t-role-category-select > .ember-basic-dropdown-trigger';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_DROPDOWN = '.t-role-category-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visit: visitable('/'),

  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`),

  roleTypeInput: text(ROLETYPE),
  roleTypeClickDropdown: clickable(ROLETYPE),
  roleTypeClickOptionOne: clickable(`${ROLETYPE_DROPDOWN} > .ember-power-select-option:contains(${RD.roleTypeGeneral})`),
  roleTypeClickOptionTwo: clickable(`${ROLETYPE_DROPDOWN} > .ember-power-select-option:contains(${RD.roleTypeContractor})`),

  // categoryInput: text(`${CATEGORY}`),
  categoryClickDropdown: clickable(CATEGORY),
  categorySelected: text(CATEGORY_ONE),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  // categoryTwoRemove: clickable(`${CATEGORY_TWO} > .ember-power-select-multiple-remove-btn`),
  // categoryTwoSelected: text(`${CATEGORY_TWO}`),
  // categoryThreeSelected: text(`${CATEGORY_THREE}`),
  categoryClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne}1)`),
  categoryClickOptionOneEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne}2)`),
  categoryClickOptionThree: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameOne}3)`),
  categoryClickOptionScooter: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains('scooter')`),
  categoryOptionLength: count(`${CATEGORY_DROPDOWN} > li`),
  categoriesSelected: count(CATEGORIES),
  categoryTwoClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CD.nameTwo})`),
});
