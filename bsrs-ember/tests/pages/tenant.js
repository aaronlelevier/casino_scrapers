import Ember from 'ember';
import { create, visitable, fillable, text, value, clickable } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL } from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const CURRENCY = '.t-currency-select';
const IMP_EMAIL = '.t-email-email:eq(0)';
const IMP_EMAIL_TYPE = '.t-email-type-select:eq(0)';
const BILL_EMAIL = '.t-email-email:eq(1)';
const BILL_PHONE = '.t-phonenumber-number:eq(0)';
const BILL_PHONE_TYPE = '.t-phone-number-type-select:eq(0)';
const BILL_EMAIL_TYPE = '.t-email-type-select:eq(0)';

const COUNTRIES = '.t-tenant-country-select .ember-power-select-multiple-option';

export default create({
  visit: visitable(TENANT_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  headerTitleText: text('.t-tenant-header'),
  companyNameValue: value('.t-tenant-company_name'),
  companyNameFill: fillable('.t-tenant-company_name'),
  companyCodeGridOne: text('.t-tenant-company_code:eq(0)'),
  companyCodeSortText: text('.t-sort-company-code'),
  companyCodeValue: value('.t-tenant-company_code'),
  companyCodeFill: fillable('.t-tenant-company_code'),
  companyNameGridOne: text('.t-tenant-company_name:eq(0)'),
  companyNameSortText: text('.t-sort-company-name'),
  companyDashboardTextValue: value('.t-tenant-dashboard_text'),
  companyDashboardTextFill: fillable('.t-tenant-dashboard_text'),
  companyImplementationContactValue: value('.t-tenant-implementation_contact_initial'),
  companyImplementationContactFill: fillable('.t-tenant-implementation_contact_initial'),
  companyImplementationEmailValue: value(IMP_EMAIL),
  companyImplementationEmailFill: fillable(IMP_EMAIL),
  companyImplementationEmailTypeValue: text(IMP_EMAIL_TYPE),
  companyBillingContactValue: value('.t-tenant-billing_contact'),
  companyBillingContactFill: fillable('.t-tenant-billing_contact'),
  companyBillingEmailValue: value(BILL_EMAIL),
  companyBillingEmailFill: fillable(BILL_EMAIL),
  companyBillingPhoneValue: value(BILL_PHONE),
  companyBillingPhoneFill: fillable(BILL_PHONE),
  companyBillingEmailTypeValue: text(BILL_EMAIL_TYPE),
  companyBillingAddressFill: fillable('.t-address-address'),
  companyBillingCityFill: fillable('.t-address-city'),
  companyBillingZipFill: fillable('.t-address-postal-code'),

  currencyInput: text(CURRENCY),
  currencySortText: text('.t-sort-currency-name'),

  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),

  testModeGridOne: value('.t-tenant-test_mode:eq(0)'),
  testModeSortText: text('.t-sort-test-mode'),
  // detail test_mode
  testModeClick: clickable('.t-tenant-test_mode'),

  implementationContact: text('.t-tenant-implementation_contact-select'),
  clearImplementationContact: clickable('.t-tenant-implementation_contact-select .ember-power-select-clear-btn')
});
