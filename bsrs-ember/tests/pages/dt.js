import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';
import DTD from 'bsrs-ember/vendor/defaults/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';

const BASE_URL = BASEURLS.base_dtd_url;
const DTDS_URL = `${BASE_URL}`;
const NEW_URL = `${BASE_URL}/new/1`;
const DETAIL_URL = `${BASE_URL}/${DTD.idOne}`;

const DESTINATION = '.t-link-destination-select .ember-basic-dropdown-trigger';
const FIELD_SELECT_OPTION = '.t-dtd-field-select .ember-basic-dropdown-trigger';

var DTPage = PageObject.create({
  requester: value('.t-dt-ticket-requester'),
  requesterFillin: fillable('.t-dt-ticket-requester'),

  locationsValue: text('.ember-basic-dropdown-trigger'),
  locationsClickDropdown: clickable('.ember-basic-dropdown-trigger'),
  locationsClickOne: clickable('.ember-basic-dropdown-trigger:eq(0)'),
  locationsOptionOneClick: clickable('.ember-power-select-option:eq(0)'),

  startBtn: value('t-dt-start'),
  clickStart: clickable('.t-dt-start'),

  // Preivew
  label: text('.t-dtd-preview-field-label'),
  note: text('.t-dtd-preview-note'),
  description: text('.t-dtd-preview-description'),
  fieldCount: count('.t-dtd-preview-field'),
  fieldOneName: text('.t-dtd-preview-field-label:eq(0)'),
  fieldOneCheckboxIsChecked: () => Ember.$('.t-dtd-field-checkbox:eq(0)').is(':checked'),
  fieldOneCheckboxCheck: clickable('.t-dtd-field-checkbox:eq(0)'),
  fieldTwoCheckboxIsChecked: () => Ember.$('.t-dtd-field-checkbox:eq(1)').is(':checked'),
  fieldTwoCheckboxCheck: clickable('.t-dtd-field-checkbox:eq(1)'),
  prompt: text('.t-dtd-preview-prompt'),
  btnCount: count('.t-dtd-preview-btn'),
  btnOneText: text('.t-dtd-preview-btn:eq(0)'),
  btnOneClick: clickable('.t-dtd-preview-btn:eq(0)'),
  // option
  fieldOneCheckboxCount: count('.t-dtd-field-checkbox')
});

export default DTPage;
