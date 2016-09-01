import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import CD from 'bsrs-ember/vendor/defaults/category';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { text, visitable, fillable, clickable, count, value, hasClass } = PageObject;
const ROLETYPE = '.t-role-role-type .ember-basic-dropdown-trigger';
const ROLETYPE_DROPDOWN = options;
const LOCATIONLEVEL = '.t-location-level-select .ember-basic-dropdown-trigger';
const LOCATIONLEVEL_DROPDOWN = options;
const CATEGORY = '.t-role-category-select .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const CATEGORIES = `${CATEGORY} > .ember-power-select-multiple-option`;
const CATEGORY_ONE = `${CATEGORIES}:eq(0)`;
const CATEGORY_DROPDOWN = options;


export default PageObject.create({
  categoryClickDropdown: clickable(CATEGORY),
  categorySelectText: text('.t-role-category-select .ember-basic-dropdown-trigger'),
  categorySelected: text(CATEGORY_ONE),
  categoryOneRemove: clickable(`${CATEGORY_ONE} > .ember-power-select-multiple-remove-btn`),
  categoryClickOptionOneEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(0)`),
  categoryClickOptionTwoEq: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:eq(1)`),
  categoryOptionLength: count(`${CATEGORY_DROPDOWN} > li`),
  categoriesSelected: count(CATEGORIES),

  dashboard_textValue: value('.t-settings-dashboard_text'),
  dashboard_textFill: fillable('.t-settings-dashboard_text'),

  locationLevelInput: text(LOCATIONLEVEL),
  locationLevelClickDropdown: clickable(LOCATIONLEVEL),
  locationLevelClickOptionOne: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameCompany})`),
  locationLevelClickOptionTwo: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameRegion})`, {multiple: true}),
  locationLevelClickOptionLossRegion: clickable(`${LOCATIONLEVEL_DROPDOWN} > .ember-power-select-option:contains(${LLD.nameLossPreventionRegion})`, {multiple: true}),

  nameFill: fillable('.t-role-name'),
  nameValue: value('.t-role-name'),
  nameValidationErrorHidden: () => Ember.$('.t-role-name-validator').is(':hidden'),
  nameValidationErrorVisible: hasClass('invalid', '.t-role-name-validator'),

  roleTypeInput: text(ROLETYPE),
  roleTypeClickDropdown: clickable(ROLETYPE),
  roleTypeClickOptionOne: clickable(`${ROLETYPE_DROPDOWN} > .ember-power-select-option:contains(${RD.roleTypeGeneral})`),
  roleTypeClickOptionTwo: clickable(`${ROLETYPE_DROPDOWN} > .ember-power-select-option:contains(${RD.roleTypeContractor})`),
});
