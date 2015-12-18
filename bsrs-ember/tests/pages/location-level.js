import PageObject from '../page-object';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

let { text, visitable, fillable, clickable, count } = PageObject;
const CHILDREN = '.t-location-level-children-select > .ember-basic-dropdown-trigger';
const CHILDREN_MULTIPLE = `${CHILDREN} > .ember-power-select-multiple-option`;
const CHILDREN_ONE = `${CHILDREN_MULTIPLE}:eq(0)`;
const CHILDREN_DROPDOWN = '.t-location-level-children-select-dropdown > .ember-power-select-options';

export default PageObject.create({
  visit: visitable('/'),
  childrenClickDropdown: clickable(CHILDREN),
  childrenSelected: text(CHILDREN_ONE),
  childrenOneRemove: clickable(`${CHILDREN_ONE} > .ember-power-select-multiple-remove-btn`),
  childrenClickOptionStore: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameStoreUn})`),
  childrenClickOptionCompany: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  childrenClickOptionDepartment: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameDepartment})`),
  childrenClickOptionRegion: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`),
  childrenClickOptionLossPreventionDistrict: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.lossPreventionDistrict})`),
  childrenClickOptionLossPreventionRegion: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameLossPreventionRegion})`),
  childrenClickOptionDistrict: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameDistrict})`),
  childrenClickOptionFacilityManagement: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameFacilityManagement})`),
  childrenClickOptionFirst: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(0)`),
  childrenClickOptionSecond: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(1)`),
  childrenClickOptionThree: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(2)`),
  childrenOptionLength: count(`${CHILDREN_DROPDOWN} > li`),
  childrenSelectedCount: count(CHILDREN_MULTIPLE),
  categoriesSelected: count(CHILDREN_MULTIPLE),
  childrenTwoClickOptionOne: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameTwo})`),
});
