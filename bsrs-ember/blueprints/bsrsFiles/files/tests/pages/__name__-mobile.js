import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import <%= FirstCharacterModuleName %>D from 'bsrs-ember/vendor/defaults/<%= dasherizedModuleName %>';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_<%= CapitalizeModule %>_URL;
const DETAIL_URL = `${BASE_URL}/${<%= FirstCharacterModuleName %>D.idOne}`;
const <%= secondPropertyCaps %> = '.t-<%= dasherizedModuleName %>-<%= secondProperty %>-select';

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFilter<%= firstPropertyTitle %>: clickable('.t-filter-<%= firstPropertySnake %>'),
  clickFilter<%= secondModelTitle %>: clickable('.t-filter-<%= secondProperty %>-name'),
  // clickFilterPriority: clickable('.t-filter-priority-name'),
  // clickFilterStatus: clickable('.t-filter-status-name'),
  // priorityOneCheck: clickable('.t-checkbox-options-<%= dasherizedModuleName %>-priority input:eq(0)'),
  // priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  // statusOneCheck: clickable('.t-checkbox-options-<%= dasherizedModuleName %>-status input:eq(0)'),
  // priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  // priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  // priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  // priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  <%= secondPropertyCamel %>Input: text(<%= secondPropertyCaps %>),
});
