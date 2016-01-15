import PageObject from '../page-object';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';

let {
  visitable, 
  clickable,
  text,
  count
} = PageObject;

const BASE_URL = BASEURLS.base_locations_url;
const DETAIL_URL = BASE_URL + '/' + LD.idOne;
const LOCATIONLEVEL = '.t-location-level-select > .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = '.t-location-level-select-dropdown > .ember-power-select-options';
const STATUS = '.t-location-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-location-status-select-dropdown > .ember-power-select-options';

const CHILDREN = '.t-location-children-select > .ember-basic-dropdown-trigger';
const CHILDRENS = `${CHILDREN} > .ember-power-select-multiple-option`;
const CHILDREN_ONE = `${CHILDRENS}:eq(0)`;
const CHILDREN_TWO = `${CHILDRENS}:eq(1)`;
const CHILDREN_THREE = `${CHILDRENS}:eq(2)`;
const CHILDREN_FOUR = `${CHILDRENS}:eq(3)`;
const CHILDREN_DROPDOWN = '.t-location-children-select-dropdown > .ember-power-select-options';

export default PageObject.create({
  visit: visitable('/'),
  visitDetail: visitable(DETAIL_URL),

  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${LDS.openName})`),
  //TODO: translate inline
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${LDS.closedNameTranslated})`),
  statusOptionLength: count(`${STATUS_DROPDOWN} > li`),

  childrenClickDropdown: clickable(CHILDREN),
  // childrenInput: text(CHILDREN),
  childrenSelected: text(CHILDREN_ONE),
  // childrenOneRemove: clickable(`${CHILDREN_ONE} > .ember-power-select-multiple-remove-btn`),
  // childrenTwoRemove: clickable(`${CHILDREN_TWO} > .ember-power-select-multiple-remove-btn`),
  childrenTwoSelected: text(CHILDREN_TWO),
  childrenThreeSelected: text(CHILDREN_THREE),
  childrenFourSelected: text(CHILDREN_FOUR),
  childrenClickApple: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.apple})`),
  childrenClickOptionOne: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.boondocks})`),
  // childrenClickOptionTwo: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.nameThree})`),
  // childrenClickMel: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.nameMel})`),
  childrenOptionLength: count(`${CHILDREN_DROPDOWN} > li`),
  // childrensSelected: count(CHILDRENS),
});
