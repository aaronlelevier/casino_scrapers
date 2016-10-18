import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import PD from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import LD from 'bsrs-ember/vendor/defaults/location';
import SD from 'bsrs-ember/vendor/defaults/status';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { visitable, text, clickable, count, fillable, value, hasClass } = PageObject;

const PREFIX = config.APP.NAMESPACE;
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;
const STATUS = '.t-status-select .ember-basic-dropdown-trigger';
const DROPDOWN = options;
const LOCATION = '.t-person-locations-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const LOCATIONS = `${LOCATION} > .ember-power-select-multiple-option`;
const LOCATION_ONE = `${LOCATIONS}:eq(0)`;
const LOCATION_TWO = `${LOCATIONS}:eq(1)`;
const ROLE = '.t-person-role-select .ember-basic-dropdown-trigger';
const LOCALE = '.t-locale-select .ember-basic-dropdown-trigger';


export default PageObject.create({
  visit: visitable(PEOPLE_URL),
  visitPeople: visitable(PEOPLE_URL),
  visitDetail: visitable(DETAIL_URL),
  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${SD.activeNameTranslated})`),
  statusClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${SD.inactiveNameTranslated})`),
  statusOptionLength: count(`${DROPDOWN} > li`),
  statusOne: text(`${DROPDOWN} > li:eq(0)`),
  statusTwo: text(`${DROPDOWN} > li:eq(1)`),
  statusThree: text(`${DROPDOWN} > li:eq(2)`),

  locationClickDropdown: clickable(LOCATION),
  locationClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.storeName})`),
  locationClickOptionOneEq: clickable(`${DROPDOWN} > .ember-power-select-option:eq(0)`),
  locationClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LD.baseStoreName}4)`),
  locationOptionLength: count(`${DROPDOWN} > li`),
  locationOneRemove: clickable(`${LOCATION_ONE} > .ember-power-select-multiple-remove-btn`),
  locationOneSelected: text(LOCATION_ONE),
  locationTwoSelected: text(LOCATION_TWO),

  roleInput: text(ROLE),
  roleClickDropdown: clickable(ROLE),
  roleClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${RD.nameOne})`),
  roleClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${RD.nameTwo})`),

  localeInput: text(LOCALE),
  localeClickDropdown: clickable(LOCALE),
  // localeClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.localeOne})`),
  localeClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${PD.localeTwo})`),
  localeOne: text(`${DROPDOWN} > li:eq(0)`),
  localeTwo: text(`${DROPDOWN} > li:eq(1)`),
  // localeThree: text(`${DROPDOWN} > li:eq(2)`),
  // localeFour: text(`${DROPDOWN} > li:eq(3)`),
  localeOptionLength: count(`${DROPDOWN} > li`),

  firstNameFill: fillable('.t-person-first-name'),
  middleInitialFill: fillable('.t-person-middle-initial'),
  lastNameFill: fillable('.t-person-last-name'),

  usernameFillIn: fillable('.t-person-username'),
  username: value('.t-person-username'),

  firstNameValidationErrorVisible: hasClass('invalid', '.t-first-name-validator'),
  lastNameValidationErrorVisible: hasClass('invalid', '.t-last-name-validator'),

  clickChangePassword: clickable('.t-person-change-password'),
  passwordFillIn: fillable('.t-person-password'),
  passwordOneTimeChecked: () => Ember.$('.t-person-password_one_time').is(':checked'),
  passwordOneTimeClick: clickable('.t-person-password_one_time-label'),
  passwordOneTimeLabelText: text('.t-person-password_one_time-label'),

});
