import PageObject from 'bsrs-ember/tests/page-object';
let { text, visitable, fillable, clickable, count, hasClass } = PageObject;
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import BASEURLS, { LOCATION_LEVELS_URL } from 'bsrs-ember/utilities/urls';


const BASE_URL = BASEURLS.base_location_levels_url;
const DETAIL_URL = BASE_URL + '/' + LLD.idOne;
const NEW_URL = BASE_URL + '/new/1';
const CHILDREN = '.t-location-level-children-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CHILDREN_MULTIPLE = `${CHILDREN} > .ember-power-select-multiple-option`;
const CHILDREN_ONE = `${CHILDREN_MULTIPLE}:eq(0)`;
const CHILDREN_DROPDOWN = '.ember-basic-dropdown-content > .ember-power-select-options';

export default PageObject.create({
  visit: visitable(BASE_URL + '/index'),
  visitDetail: visitable(DETAIL_URL),
  visitNew: visitable(NEW_URL),
  nameFill: fillable('.t-location-level-name'),
  childrenClickDropdown: clickable(CHILDREN),
  childrenSelected: text(CHILDREN_ONE),
  childrenOneRemove: clickable(`${CHILDREN_ONE} > .ember-power-select-multiple-remove-btn`),
  childrenClickOptionStore: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameStoreUn})`),
  childrenClickOptionCompany: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  childrenClickOptionDepartment: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameDepartment})`),
  childrenClickOptionRegion: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`, {multiple: true}),
  childrenClickOptionLossPreventionDistrict: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.lossPreventionDistrict})`),
  childrenClickOptionLossPreventionRegion: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameLossPreventionRegion})`, {multiple: true}),
  childrenClickOptionDistrict: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameDistrict})`),
  childrenClickOptionFacilityManagement: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameFacilityManagement})`),
  childrenClickOptionFirst: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(0)`),
  childrenClickOptionSecond: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(1)`),
  childrenClickOptionThree: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:eq(2)`),
  childrenOptionLength: count(`${CHILDREN_DROPDOWN} > li`),
  childrenSelectedCount: count(CHILDREN_MULTIPLE),
  categoriesSelected: count(CHILDREN_MULTIPLE),
  childrenTwoClickOptionOne: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameTwo})`),

  //validation
  nameValidationErrorVisible: hasClass('invalid', '.t-location-level-name-validator'),
});
