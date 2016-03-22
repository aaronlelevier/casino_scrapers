import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

const DROPDOWN = options;
const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

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

    addLinkBtn: value('.t-add-link-btn'),
    clickAddLinkBtn: clickable('.t-add-link-btn'),

    isDirty: hasClass('dirty', 'i', {scope: '.t-tab-close'}),
    clickPreviewToggle: clickable('.t-dtd-preview'),
    clickDetailToggle: clickable('.t-dtd-detail'),
    clickListToggle: clickable('.t-dtd-list'),

    listButtonOn: hasClass('on', 'button.t-dtd-list'),
    listButtonOff: hasClass('off', 'button.t-dtd-list'),
    detailButtonOn: hasClass('on', 'button.t-dtd-detail'),
    detailButtonOff: hasClass('off', 'button.t-dtd-detail'),
    previewButtonOn: hasClass('on', 'button.t-dtd-preview'),
    previewButtonOff: hasClass('off', 'button.t-dtd-preview'),

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

    noteTypeLength: count('.t-dtd-note_type'),
    noteTypeInput: text('.t-dtd-note_type'),
    noteTypeClickDropdown: clickable('.t-dtd-note_type > .ember-basic-dropdown-trigger'),
    noteTypeClickOptionTwo: clickable(`.ember-power-select-option:contains(${DTD.noteTypeTwo})`, { scope: DROPDOWN }),
    noteTypeClickOptionTwoValue: clickable(`.ember-power-select-option:contains(${DTD.noteTypeTwoValue})`, { scope: DROPDOWN }),

    addFieldBtn: clickable('.t-add-field-btn'),
    fieldLabelOne: value('.t-dtd-field-label:eq(0)'),
    fieldLabelOneFillin: fillable('.t-dtd-field-label:eq(0)'),
    fieldTypeOne: text('.t-dtd-field-type:eq(0)'),
    fieldTypeOneClickDropdown: clickable('.t-dtd-field-type > .ember-basic-dropdown-trigger'),
    fieldTypeOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${FD.typeTwoValue})`, { scope: DROPDOWN }),
    fieldTypeOneClickOptionTwoValue: clickable(`.ember-power-select-option:contains(${FD.typeTwoValue})`, { scope: DROPDOWN }),
    fieldRequiredOneNotChecked: () => Ember.$('.t-dtd-field-required:eq(0)').is(':not(:checked)'),
    fieldRequiredOneChecked: () => Ember.$('.t-dtd-field-required:eq(0)').is(':checked'),
    fieldRequiredOneClick: clickable('.t-dtd-field-required:eq(0)'),

    fieldOptionText: value('.t-dtd-field-option-text'),
    fieldOptionTextFillin: fillable('.t-dtd-field-option-text'),
    addFieldOption: clickable('.t-add-field-option-btn')
});

export default DTDPage;
