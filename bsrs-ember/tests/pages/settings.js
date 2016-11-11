import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;
import { POWER_SELECT_OPTIONS } from 'bsrs-ember/tests/helpers/power-select-terms';

const START_DTD_SELECT = '.t-settings-dt_start-select .ember-basic-dropdown-trigger';

var SettingsPage = PageObject.create({
  authAmountInheritedFromText: value('.t-inherited-msg-auth_amount'),

  companyNameValue: value('.t-settings-company_name'),
  companyNameFill: fillable('.t-settings-company_name'),
  companyCodeValue: value('.t-settings-company_code'),
  companyCodeFill: fillable('.t-settings-company_code'),

  dashboardTextValue: value('.t-settings-dashboard_text'),
  dashboardTextFill: fillable('.t-settings-dashboard_text'),
  dashboardTextInheritedFrom: text('.t-inherited-msg-dashboard_text'),
  dashboardTextInheritedFromClick: clickable('.t-inherited-msg-dashboard_text-link'),
  dashboardPlaceholderValue: () => Ember.$('.t-settings-dashboard_text').get(0)['placeholder'],

  loginGraceValue: value('.t-settings-login_grace'),
  modulesInvoicesChecked: () => Ember.$('.t-settings-modules-invoices').is(':checked'),
  modulesInvoicesClick: clickable('.t-settings-modules-invoices-label'),
  modulesInvoicesLabelText: text('.t-settings-modules-invoices-label'),
  modulesTicketsChecked: () => Ember.$('.t-settings-modules-tickets').is(':checked'),
  modulesTicketsClick: clickable('.t-settings-modules-tickets-label'),
  modulesTicketsLabelText: text('.t-settings-modules-tickets-label'),
  modulesWorkordersChecked: () => Ember.$('.t-settings-modules-work_orders').is(':checked'),
  modulesWorkordersClick: clickable('.t-settings-modules-work_orders-label'),
  modulesWorkordersLabelText: text('.t-settings-modules-work_orders-label'),
  testContractorEmailValue: value('.t-settings-test_contractor_email'),
  testContractorPhoneValue: value('.t-settings-test_contractor_phone'),
  testmodeChecked: () => Ember.$('.t-settings-test_mode').is(':checked'),
  testmodeClick: clickable('.t-settings-test_mode-label'),
  testmodelLableText: text('.t-settings-test_mode-label'),
  titleText: text('.t-settings-title'),
  startDtdInput: text(START_DTD_SELECT),
  startDtdClickDropdown: clickable(START_DTD_SELECT),
  startDtdClickOne: clickable('.ember-power-select-option:eq(1)', { scope: POWER_SELECT_OPTIONS }),
  startDtdTextOne: text('.ember-power-select-option:eq(1)'),

  deleteDropdownClick: clickable('.t-dropdown-delete'),
});

export default SettingsPage;
