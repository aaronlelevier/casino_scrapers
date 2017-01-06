import Ember from 'ember';
import { create, visitable, fillable, text, value } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { WORK_ORDER_URL, WORK_ORDER_LIST_URL } from 'bsrs-ember/utilities/urls';
import WD from 'bsrs-ember/vendor/defaults/work-order';

const BASE_URL = BASEURLS.BASE_WORK_ORDER_URL;
const DETAIL_URL = `${BASE_URL}/${WD.idOne}`;
const COST_ESTIMATE_CURRENCY = '.t-work-order-cost_estimate_currency-select';

export default create({
  visit: visitable(WORK_ORDER_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  providerNameValue: value('.t-work-order-provider_name'),
  providerNameFill: fillable('.t-work-order-provider_name'),
  providerNameGridOne: text('.t-work-order-provider_name:eq(0)'),
  providerNameSortText: text('.t-sort-provider_name'),

  // costEstimateCurrencyInput: text(costEstimateCurrency),
  cost_estimate_currencySortText: text('.t-sort-cost_estimate_currency-name'),
  cost_estimate_currencyGridOne: text('.t-work-order-cost_estimate_currency-name:eq(0)'),
});
