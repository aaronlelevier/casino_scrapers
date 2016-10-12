import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_TENANT_URL;
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFiltercompanyName: clickable('.t-filter-company_name'),
  clickFilterCurrency: clickable('.t-filter-currency-name'),
  // clickFilterPriority: clickable('.t-filter-priority-translated-name'),
  // clickFilterStatus: clickable('.t-filter-status-translated-name'),
  // priorityOneCheck: clickable('.t-checkbox-options-tenant-priority input:eq(0)'),
  // priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  // statusOneCheck: clickable('.t-checkbox-options-tenant-status input:eq(0)'),
  // priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  // priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  // priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  // priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  currencyInput: text('.t-currency-select'),

  companyName: value('.t-tenant-company_name'),
  companyNameFill: fillable('.t-tenant-company_name'),
});
