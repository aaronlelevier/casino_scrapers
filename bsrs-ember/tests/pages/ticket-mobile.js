import Ember from 'ember';
import { visitable, fillable, value, create, clickable, text, isVisible } from 'ember-cli-page-object';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/utilities/urls';

const BASE_URL = BASEURLS.base_tickets_url;
const LOCATION = '.t-ticket-location-select .ember-basic-dropdown-trigger';
const ASSIGNEE = '.t-ticket-assignee-select .ember-basic-dropdown-trigger';
const DETAIL_URL = `${BASE_URL}/${TD.idOne}`;

export default create({
  visitDetail: visitable(DETAIL_URL),
  toggleFilter: clickable('.t-mobile-filter'),
  filterAndSort: isVisible('.t-mobile-filters'),
  clickFilterRequest: clickable('.t-filter-request'),
  clickFilterLocation: clickable('.t-filter-location-name'),
  clickFilterAssignee: clickable('.t-filter-assignee-fullname'),
  clickFilterPriority: clickable('.t-filter-priority-name'),
  clickFilterStatus: clickable('.t-filter-status-name'),
  priorityOneCheck: clickable('.t-checkbox-options-ticket-priority input:eq(0)'),
  priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  statusOneCheck: clickable('.t-checkbox-options-ticket-status input:eq(0)'),
  priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),

  locationInput: text(LOCATION),
  assigneeInput: text(ASSIGNEE),

  request: value('.t-mobile-ticket-request'),
  requestFillIn: fillable('.t-mobile-ticket-request'),
});
