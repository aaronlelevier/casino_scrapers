import PageObject from 'bsrs-ember/tests/page-object';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LDS from 'bsrs-ember/vendor/defaults/location-status';
import { options, multiple_options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { LOCATIONS_URL } from 'bsrs-ember/utilities/urls';

let { visitable, clickable, text, count, fillable, value, hasClass } = PageObject;

const BASE_URL = BASEURLS.base_locations_url;
const DETAIL_URL = `${BASE_URL}/${LD.idOne}`;
const NEW_URL = `${BASE_URL}/new/1`;
const LOCATIONLEVEL = '.t-location-level-select .ember-basic-dropdown-trigger';
const STATUS = '.t-status-select .ember-basic-dropdown-trigger';
const DROPDOWN = options;

const CHILDREN = '.t-location-children-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CHILDRENS = `${CHILDREN} > .ember-power-select-multiple-option`;
const CHILDREN_ONE = `${CHILDRENS}:eq(0)`;
const CHILDREN_TWO = `${CHILDRENS}:eq(1)`;
const CHILDREN_THREE = `${CHILDRENS}:eq(2)`;
const CHILDREN_FOUR = `${CHILDRENS}:eq(3)`;
const CHILDREN_DROPDOWN = `.ember-basic-dropdown-content > ${options}`;

const PARENT = '.t-location-parent-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const PARENTS = `${PARENT} > .ember-power-select-multiple-option`;
const PARENTS_ONE = `${PARENTS}:eq(0)`;
const PARENTS_TWO = `${PARENTS}:eq(1)`;
const PARENTS_THREE = `${PARENTS}:eq(2)`;
const PARENTS_FOUR = `${PARENTS}:eq(3)`;
const PARENTS_DROPDOWN = `.ember-basic-dropdown-content > ${options}`;

const COUNTRIES = '.t-address-country .ember-basic-dropdown-trigger';
const STATES = '.t-address-state .ember-basic-dropdown-trigger';
const ADDRESS_TYPES = '.t-address-type-select .ember-basic-dropdown-trigger';
const EMAIL_TYPES = '.t-email-type-select .ember-basic-dropdown-trigger';
const PHONE_NUMBER_TYPES = '.t-phone-number-type-select .ember-basic-dropdown-trigger';

export default PageObject.create({
  visit: visitable(BASE_URL + '/index'),
  visitDetail: visitable(DETAIL_URL),
  visitNew: visitable(NEW_URL),

  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`, {multiple: true}),
  locationLevelClickOptionLossRegion: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LLD.nameLossPreventionRegion})`),

  statusInput: text(STATUS),
  statusClickDropdown: clickable(STATUS),
  statusClickOptionOne: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LDS.openNameTranslated})`),
  //TODO: translate inline
  statusClickOptionTwo: clickable(`${DROPDOWN} > .ember-power-select-option:contains(${LDS.closedNameTranslated})`),
  statusOptionLength: count(`${DROPDOWN} > li`),

  childrenClickDropdown: clickable(CHILDREN),
  // childrenInput: text(CHILDREN),
  childrenSelected: text(CHILDREN_ONE),
  childrenOneRemove: clickable(`${CHILDREN_ONE} > .ember-power-select-multiple-remove-btn`),
  childrenTwoRemove: clickable(`${CHILDREN_TWO} > .ember-power-select-multiple-remove-btn`),
  childrenTwoSelected: text(CHILDREN_TWO),
  childrenThreeSelected: text(CHILDREN_THREE),
  childrenFourSelected: text(CHILDREN_FOUR),
  childrenClickApple: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.apple})`),
  childrenClickOptionOne: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.boondocks})`),
  childrenClickOptionStoreNameOne: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.baseStoreName})`),
  childrenClickOptionStoreNameTwo: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameTwo})`),
  childrenClickOptionStoreNameThree: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameThree})`),
  // childrenClickOptionTwo: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.nameThree})`),
  // childrenClickMel: clickable(`${CHILDREN_DROPDOWN} > .ember-power-select-option:contains(${LD.nameMel})`),
  childrenOptionLength: count(`${CHILDREN_DROPDOWN} > li`),
  // childrensSelected: count(CHILDRENS),

  parentsClickDropdown: clickable(PARENT),
  parentsSelected: text(PARENTS_ONE),
  parentsOneRemove: clickable(`${PARENTS_ONE} > .ember-power-select-multiple-remove-btn`),
  parentsTwoRemove: clickable(`${PARENTS_TWO} > .ember-power-select-multiple-remove-btn`),
  parentsTwoSelected: text(PARENTS_TWO),
  parentsThreeSelected: text(PARENTS_THREE),
  parentsFourSelected: text(PARENTS_FOUR),
  parentsClickApple: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.apple})`),
  parentsClickOptionOne: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.boondocks})`),
  parentsClickOptionStoreNameOne: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.baseStoreName})`),
  parentsClickOptionStoreNameFirst: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameParent})`),
  parentsClickOptionStoreNameTwo: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameParentTwo})`),
  parentsClickOptionStoreNameThree: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.storeNameThree})`),
  // parentsClickOptionTwo: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.nameThree})`),
  // parentsClickMel: clickable(`${PARENTS_DROPDOWN} > .ember-power-select-option:contains(${LD.nameMel})`),
  parentsOptionLength: count(`${PARENTS_DROPDOWN} > li`),
  // parentssSelected: count(PARENTSS),

  phonenumberFillIn: fillable('.t-phonenumber-number0'),
  phonenumberThirdFillIn: fillable('.t-phonenumber-number2'),
  emailFillIn: fillable('.t-email-email0'),
  emailThirdFillIn: fillable('.t-email-email2'),
  addressThirdFillIn: fillable('.t-address-address2'),
  addressFillIn: fillable('.t-address-address0'),
  addressCityFill: fillable('.t-address-city0'),
  addressPostalCodeFillIn: fillable('.t-address-postal-code0'),
  addressPostalCodeThirdFillIn: fillable('.t-address-postal-code2'),

  addressAddressValue: value('.t-address-address0'),
  addressCityValue: value('.t-address-city0'),
  addressPostalCodeValue: value('.t-address-postal-code0'),

  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),
  stateSelectedOne: text(`${STATES}:eq(0)`),
  addressTypeSelectedOne: text(`${ADDRESS_TYPES}:eq(0)`),
  addressTypeSelectedThree: text(`${ADDRESS_TYPES}:eq(0)`),

  clickAddEmail: clickable('.t-add-email-btn'),
  clickDeleteEmail: clickable('.t-del-email-btn'),
  emailTypeSelectedOne: text(`${EMAIL_TYPES}:eq(0)`),

  clickAddPhoneNumber: clickable('.t-add-phone-number-btn'),
  clickDeletePhoneNumber: clickable('.t-del-phone-number-btn'),
  phonenumberTypeSelectedOne: text(`${PHONE_NUMBER_TYPES}:eq(0)`),

  clickAddAddress: clickable('.t-add-address-btn'),
  clickDeleteAddress: clickable('.t-del-address-btn'),

  // Validation
  nameValidationErrorVisible: hasClass('invalid', '.t-location-name-validator'),
  numberValidationErrorVisible: hasClass('invalid', '.t-location-number-validator'),
  statusValidationErrorVisible: hasClass('invalid', '.t-status-select'),
  llevelValidationErrorVisible: hasClass('invalid', '.t-location-level-select'),
  phonenumberZeroValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator0'),
  phonenumberOneValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator1'),
  phonenumberTwoValidationErrorVisible: hasClass('invalid', '.t-phonenumber-number-validator2'),
  emailZeroValidationErrorVisible: hasClass('invalid', '.t-location-email-validator0'),
  emailOneValidationErrorVisible: hasClass('invalid', '.t-location-email-validator1'),
  emailTwoValidationErrorVisible: hasClass('invalid', '.t-location-email-validator2'),
  addressZeroValidationErrorVisible: hasClass('invalid', '.t-address-address-validator0'),
  addressOneValidationErrorVisible: hasClass('invalid', '.t-address-address-validator1'),
  addressTwoValidationErrorVisible: hasClass('invalid', '.t-address-address-validator2'),
  postalCodeZeroValidationErrorVisible: hasClass('invalid', '.t-address-postal-code-validator0'),
  postalCodeOneValidationErrorVisible: hasClass('invalid', '.t-address-postal-code-validator1'),
  postalCodeTwoValidationErrorVisible: hasClass('invalid', '.t-address-postal-code-validator2'),

});
