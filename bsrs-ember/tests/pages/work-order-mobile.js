import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import WD from 'bsrs-ember/vendor/defaults/work-order';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_WORK_ORDER_URL;
const DETAIL_URL = `${BASE_URL}/${WD.idOne}`;
const COST_ESTIMATE_CURRENCY = '.t-work-order-cost_estimate_currency-select';

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFilterproviderName: clickable('.t-filter-provider_name'),
  clickFilterCurrency: clickable('.t-filter-cost_estimate_currency-name'),
  // clickFilterPriority: clickable('.t-filter-priority-translated-name'),
  // clickFilterStatus: clickable('.t-filter-status-translated-name'),
  // priorityOneCheck: clickable('.t-checkbox-options-work-order-priority input:eq(0)'),
  // priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  // statusOneCheck: clickable('.t-checkbox-options-work-order-status input:eq(0)'),
  // priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  // priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  // priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  // priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  costEstimateCurrencyInput: text(COST_ESTIMATE_CURRENCY),
});
