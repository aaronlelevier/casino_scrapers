import Ember from 'ember';
import { create, visitable, fillable, text, value } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { TENANT_URL, TENANT_LIST_URL } from 'bsrs-ember/utilities/urls';
import TD from 'bsrs-ember/vendor/defaults/tenant';

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;
const CURRENCY = '.t-currency-select';

const COUNTRIES = '.t-tenant-country-select .ember-power-select-multiple-option';

export default create({
  visit: visitable(TENANT_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  companyNameValue: value('.t-tenant-company_name'),
  companyNameFill: fillable('.t-tenant-company_name'),
  companyNameGridOne: text('.t-tenant-company_name:eq(0)'),
  companyNameSortText: text('.t-sort-company-name'),

  currencyInput: text(CURRENCY),
  currencySortText: text('.t-sort-currency-name'),
  currencyGridOne: text('.t-tenant-currency-name:eq(0)'),

  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),
  
});
