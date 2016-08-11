import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const ASSIGNEE = '.t-ticket-assignee-select';

export default create({
  visitDetail: visitable(DETAIL_URL),
  clickFilterDescription: clickable('.t-filter-description'),
  clickFilterAssignee: clickable('.t-filter-assignee-fullname'),
  // clickFilterPriority: clickable('.t-filter-priority-translated-name'),
  // clickFilterStatus: clickable('.t-filter-status-translated-name'),
  // priorityOneCheck: clickable('.t-checkbox-options-assignment-priority input:eq(0)'),
  // priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  // statusOneCheck: clickable('.t-checkbox-options-assignment-status input:eq(0)'),
  // priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  // priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  // priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  // priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  assigneeInput: text(ASSIGNEE),
});
