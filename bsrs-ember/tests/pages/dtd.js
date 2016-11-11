import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';
import { POWER_SELECT_OPTIONS } from 'bsrs-ember/tests/helpers/power-select-terms';

const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

const DESTINATION = '.t-link-destination-select .ember-basic-dropdown-trigger';
const FIELD_SELECT_OPTION = '.t-dtd-field-select .ember-basic-dropdown-trigger';

var DTDPage = PageObject.create({
  visit: visitable(DTDS_URL),
  visitDetail: visitable(DETAIL_URL),
  visitNew: visitable(NEW_URL),
  // update: clickable('.t-ticket-action-save'),

  titleText: text('.t-dtd-detail-title'),
  emptyDetailHint: text('.t-dtd-empty-detail'),
  emptyDetailText: text('.t-dtd-empty-title:eq(0)'),
  emptyPreviewText: text('.t-dtd-empty-title:eq(1)'),
  key: value('.t-dtd-single-key:eq(0)'),
  keyFillIn: fillable('.t-dtd-single-key:eq(0)'),
  description: value('.t-dtd-single-description:eq(0)'),
  descriptionFillIn: fillable('.t-dtd-single-description:eq(0)'),
  prompt: value('.t-dtd-prompt:eq(0)'),
  promptFillIn: fillable('.t-dtd-prompt:eq(0)'),
  note: value('.t-dtd-note:eq(0)'),
  noteFillIn: fillable('.t-dtd-note:eq(0)'),
  // Link 1
  action_button: () => Ember.$('.t-dtd-link-action_button:eq(0)').is(':checked'),
  action_buttonClick: clickable('.t-dtd-link-action_button:eq(0)'),
  action_buttonVisible: count('.t-dtd-link-action_button:eq(0)'),
  is_header: () => Ember.$('.t-dtd-link-is_header:eq(0)').is(':checked'),
  is_headerClick: clickable('.t-dtd-link-is_header:eq(0)'),
  is_headerVisible: count('.t-dtd-link-is_header:eq(0)'),
  request: value('.t-dtd-link-request:eq(0)'),
  requestFillIn: fillable('.t-dtd-link-request:eq(0)'),
  text: value('.t-dtd-link-text:eq(0)'),
  textFillIn: fillable('.t-dtd-link-text:eq(0)'),

  destinationInput: text(DESTINATION),
  destinationClickDropdownOne: clickable(`${DESTINATION}:eq(0)`),
  destinationClickDropdownTwo: clickable(`${DESTINATION}:eq(1)`),
  // destinationClickOptionOne: clickable(`${POWER_SELECT_OPTIONS} > .ember-power-select-option:contains(${PD.name})`),
  destinationClickOptionOne: clickable(`.ember-power-select-option:eq(0)`, { scope: POWER_SELECT_OPTIONS }),
  destinationClickOptionTwo: clickable(`.ember-power-select-option:eq(1)`, { scope: POWER_SELECT_OPTIONS }),
  // destinationClickIdThree: clickable(`${POWER_SELECT_OPTIONS} > .ember-power-select-option:contains(${PD.storeNameThree})`),
  // destinationOptionLength: count('li', { scope: POWER_SELECT_OPTIONS }),
  destinationSearch: fillable('.ember-power-select-search > input'),

  // Link 2
  action_button_two: () => Ember.$('.t-dtd-link-action_button:eq(1)').is(':checked'),
  action_buttonClick_two: clickable('.t-dtd-link-action_button:eq(1)'),
  is_header_two: () => Ember.$('.t-dtd-link-is_header:eq(1)').is(':checked'),
  is_headerClick_two: clickable('.t-dtd-link-is_header:eq(1)'),
  request_two: value('.t-dtd-link-request:eq(1)'),
  requestFillIn_two: fillable('.t-dtd-link-request:eq(1)'),
  text_two: value('.t-dtd-link-text:eq(1)'),
  textFillIn_two: fillable('.t-dtd-link-text:eq(1)'),
  textCount: count('.t-dtd-link-text'),
  textIsRequiredError: () => Ember.$('.t-dtd-link-text-error').text().trim(),

  isDirty: hasClass('dirty', 'i', {scope: '.t-tab-close'}),
  clickPreviewToggle: clickable('button.t-dtd-preview'),
  clickDetailToggle: clickable('.t-dtd-detail'),
  clickListToggle: clickable('.t-dtd-list'),

  listButtonOn: hasClass('on', 'button.t-dtd-list'),
  listButtonOff: hasClass('off', 'button.t-dtd-list'),
  detailButtonOn: hasClass('on', 'button.t-dtd-detail'),
  detailButtonOff: hasClass('off', 'button.t-dtd-detail'),
  previewButtonOn: hasClass('on', 'button.t-dtd-preview'),
  previewButtonOff: hasClass('off', 'button.t-dtd-preview'),

  addLinkBtn: clickable('.t-add-link-btn'),
  linkTextLength: count('.t-dtd-link-text'),
  linkTypeLength: count('.t-dtd-link_type'),
  linkTypeLabelOne: text('.t-dtd-link_type-label:eq(0)'),
  linkTypeLabelTwo: text('.t-dtd-link_type-label:eq(1)'),
  linkTypeSelectedOne: () => Ember.$('.t-dtd-link_type:eq(0)').is(':checked'),
  linkTypeSelectedTwo: () => Ember.$('.t-dtd-link_type:eq(1)').is(':checked'),
  linkTypeOneClick: clickable('.t-dtd-link_type:eq(0)'),
  linkTypeTwoClick: clickable('.t-dtd-link_type:eq(1)'),

  previewHasList: hasClass('dtd-list', '.t-dtd-preview-links'),
  previewHasButtons: hasClass('dtd-buttons', '.t-dtd-preview-links'),
  previewDescription: text('.t-dtd-preview-description'),
  previewPrompt: text('.t-dtd-preview-prompt'),
  previewNote: text('.t-dtd-preview-note'),
  previewButtonOne: text('.t-dtd-preview-btn:eq(0)'),
  previewLinkHeaderText: text('.t-dtd-preview-link-header h4'),
  previewActionButton: hasClass('btn-primary', '.t-dtd-preview-btn'),

  // noteTypeLength: count('.t-dtd-note_type'),
  noteTypeInput: text('.t-dtd-note_type'),
  noteTypeClickDropdown: clickable('.t-dtd-note_type .ember-basic-dropdown-trigger'),
  noteTypeClickOptionTwo: clickable(`.ember-power-select-option:contains(${DTD.noteTypeTwo})`, { scope: POWER_SELECT_OPTIONS }),
  noteTypeClickOptionTwoValue: clickable(`.ember-power-select-option:contains(${DTD.noteTypeTwoValue})`, { scope: POWER_SELECT_OPTIONS }),


  fieldLabelCount: count('.t-dtd-field-label'),
  fieldOneDelete: clickable('.t-del-field-btn:eq(0)'),
  fieldTwoDelete: clickable('.t-del-field-btn:eq(1)'),
  // Field One
  fieldLabelOne: value('.t-dtd-field-label:eq(0)'),
  fieldLabelOneFillin: fillable('.t-dtd-field-label:eq(0)'),
  fieldTypeOne: text('.t-dtd-field-type:eq(0)'),
  fieldTypeOneClickDropdown: clickable('.t-dtd-field-type .ember-basic-dropdown-trigger'),
  fieldTypeOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${FD.typeTwo})`, { scope: POWER_SELECT_OPTIONS }),
  fieldTypeOneClickOptionThree: clickable(`.ember-power-select-option:contains(${FD.typeThree})`, { scope: POWER_SELECT_OPTIONS }),
  fieldTypeOneClickOptionFourTranslated: clickable(`.ember-power-select-option:contains(${FD.typeFour})`, { scope: POWER_SELECT_OPTIONS }),
  fieldTypeOneClickOptionFour: clickable(`.ember-power-select-option:contains(${FD.typeFourValue})`, { scope: POWER_SELECT_OPTIONS }),
  fieldTypeOneClickOptionSix: clickable(`.ember-power-select-option:contains(${FD.typeSix})`, { scope: POWER_SELECT_OPTIONS }),
  fieldRequiredOneNotChecked: () => Ember.$('.t-dtd-field-required:eq(0)').is(':not(:checked)'),
  fieldRequiredOneChecked: () => Ember.$('.t-dtd-field-required:eq(0)').is(':checked'),
  fieldRequiredOneClick: clickable('.t-dtd-field-required:eq(0)'),
  fieldOneAddFieldOption: clickable('.t-add-field-option-btn'),
  fieldOneOptionText: value('.t-dtd-field-option-text'),
  fieldOneOptionTextFillin: fillable('.t-dtd-field-option-text'),
  // Field Two
  fieldLabelTwo: value('.t-dtd-field-label:eq(1)'),
  fieldLabelTwoFillin: fillable('.t-dtd-field-label:eq(1)'),
  fieldTypeTwo: text('.t-dtd-field-type:eq(1)'),
  fieldTypeTwoClickDropdown: clickable('.t-dtd-field-type:eq(1) .ember-basic-dropdown-trigger'),
  fieldTypeTwoClickOptionTwo: clickable(`.ember-power-select-option:contains(${FD.typeTwoValue})`, { scope: POWER_SELECT_OPTIONS }),
  // fieldTypeTwoClickOptionTwoValue: clickable(`.ember-power-select-option:contains(${FD.typeTwoValue})`, { scope: POWER_SELECT_OPTIONS }),
  fieldTypeTwoClickOptionFour: clickable(`.ember-power-select-option:contains(${FD.typeFourValue})`, { scope: POWER_SELECT_OPTIONS }),
  fieldRequiredTwoNotChecked: () => Ember.$('.t-dtd-field-required:eq(1)').is(':not(:checked)'),
  fieldRequiredTwoChecked: () => Ember.$('.t-dtd-field-required:eq(1)').is(':checked'),
  fieldRequiredTwoClick: clickable('.t-dtd-field-required:eq(1)'),
  fieldTwoAddFieldOption: clickable('.t-add-field-option-btn:eq(1)'),
  fieldTwoOptionText: value('.t-dtd-field-option-text:eq(1)'),
  fieldTwoOptionTextFillin: fillable('.t-dtd-field-option-text:eq(1)'),

  fieldOptionSelected: text('.t-dtd-field-select .ember-power-select-selected-item'),
  fieldOptionOne: text('.t-dtd-field-select li:eq(0)'),
  fieldOptionTwo: text('.t-dtd-field-select li:eq(1)'),

  removePriority: clickable('.t-ticket-priority-select .ember-power-select-trigger > .ember-power-select-clear-btn'),
  removeStatus: clickable('.t-ticket-status-select .ember-power-select-trigger > .ember-power-select-clear-btn'),
  removeTopLevelCategory: clickable('.ember-power-select-clear-btn:eq(0)'),
  removeMiddleCategory: clickable('.ember-power-select-clear-btn:eq(1)'),
  removeLeafCategory: clickable('.ember-power-select-clear-btn:eq(2)'),

  // DT
  addFieldBtn: clickable('.t-add-field-btn'),
  fieldFillInTextOne: fillable('.t-dtd-field-text:eq(0)'),
  fieldClickCheckboxOne: clickable('.t-dtd-field-checkbox:eq(0)'),
  clickNextBtn: clickable('.t-dtd-preview-btn'),
  selectClickDropdown: clickable(FIELD_SELECT_OPTION),
  selectOneOption: clickable(`.ember-power-select-option:contains(${OD.textOne})`, { scope: POWER_SELECT_OPTIONS }),
  selectOneValue: text(FIELD_SELECT_OPTION),

  breadcrumbText: text('.t-dt-breadcrumb'),
  breadcrumbOne: text('.t-ticket-breadcrumb-back:eq(0)'),
  breadcrumbTwo: text('.t-ticket-breadcrumb-back:eq(1)'),
});

export default DTDPage;
