import PageObject from '../page-object';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/location';
import SD from 'bsrs-ember/vendor/defaults/status';

let {
  visitable,
  text,
  clickable,
  count
} = PageObject;

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const STATUS = '.t-person-status-select > .ember-basic-dropdown-trigger';
const STATUS_DROPDOWN = '.t-person-status-select-dropdown > .ember-power-select-options';
const LOCATION = '.t-person-locations-select > .ember-basic-dropdown-trigger';
const LOCATION_DROPDOWN = '.t-person-locations-select-dropdown > .ember-power-select-options';
const LOCATIONS = `${LOCATION} > .ember-power-select-multiple-option`;
const LOCATION_ONE = `${LOCATIONS}:eq(0)`;
const LOCATION_TWO = `${LOCATIONS}:eq(1)`;
const ROLE = '.t-person-role-select > .ember-basic-dropdown-trigger';
const ROLE_DROPDOWN = '.t-person-role-select-dropdown > .ember-power-select-options';
const LOCALE = '.t-locale-select > .ember-basic-dropdown-trigger';
const LOCALE_DROPDOWN = '.t-locale-select-dropdown > .ember-power-select-options';


export default PageObject.create({
  visit: visitable('/'),
  visitDetail: visitable(DETAIL_URL),
  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.activeName})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${SD.inactiveName})`),
  statusOptionLength: count(`${STATUS_DROPDOWN} > li`),
  statusOne: text(`${STATUS_DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${STATUS_DROPDOWN} > li:eq(1)`),
  statusThree: text(`${STATUS_DROPDOWN} > li:eq(2)`),

  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LD.storeName})`),
  locationClickOptionOneEq: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:eq(0)`),
  locationClickOptionTwo: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LD.baseStoreName}4)`),
  locationOptionLength: count(`${LOCATION_DROPDOWN} > li`),
  locationOneRemove: clickable(`${LOCATION_ONE} > .ember-power-select-multiple-remove-btn`),
  locationOneSelected: text(LOCATION_ONE),
  locationTwoSelected: text(LOCATION_TWO),

  roleInput: text(ROLE),
  roleClickDropdown: clickable(ROLE),
  roleClickOptionOne: clickable(`${ROLE_DROPDOWN} > .ember-power-select-option:contains(${RD.nameOne})`),
  roleClickOptionTwo: clickable(`${ROLE_DROPDOWN} > .ember-power-select-option:contains(${RD.nameTwo})`),

  localeInput: text(LOCALE),
  localeClickDropdown: clickable(LOCALE),
  // localeClickOptionOne: clickable(`${LOCALE_DROPDOWN} > .ember-power-select-option:contains(${PD.localeOne})`),
  localeClickOptionTwo: clickable(`${LOCALE_DROPDOWN} > .ember-power-select-option:contains(${PD.localeTwo})`),
  localeOne: text(`${LOCALE_DROPDOWN} > li:eq(0)`),
  localeTwo: text(`${LOCALE_DROPDOWN} > li:eq(1)`),
  // localeThree: text(`${LOCALE_DROPDOWN} > li:eq(2)`),
  // localeFour: text(`${LOCALE_DROPDOWN} > li:eq(3)`),
  localeOptionLength: count(`${LOCALE_DROPDOWN} > li`),
});
