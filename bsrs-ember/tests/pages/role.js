import PageObject from 'bsrs-ember/tests/page-object';
import CD from 'bsrs-ember/vendor/defaults/category';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

let { text, visitable, fillable, clickable, count } = PageObject;
const ROLETYPE = '.t-role-role-type > .ember-basic-dropdown-trigger';
const ROLETYPE_DROPDOWN = '.t-role-role-type-dropdown > .ember-power-select-options';
const LOCATIONLEVEL = '.t-location-level-select > .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = '.t-location-level-select-dropdown > .ember-power-select-options';
const CATEGORY = '.t-role-category-select > .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
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

  categoryClickDropdown: clickable(CATEGORY),
  categorySelected: text(CATEGORY_ONE),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  categoryClickOptionOneEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwoEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(1)`),
  categoryOptionLength: count(`${CATEGORY_DROPDOWN} > li`),
  categoriesSelected: count(CATEGORIES),
});
