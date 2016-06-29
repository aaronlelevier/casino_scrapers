import Ember from 'ember';
import { create, clickable, isVisible } from 'ember-cli-page-object';

export default create({
  toggleFilter: clickable('.t-mobile-filter'),
  filterAndSort: isVisible('.t-mobile-filters'),
  clickFilterRequest: clickable('.t-filter-request'),
  clickFilterPriority: clickable('.t-filter-priority-translated-name'),
  clickFilterStatus: clickable('.t-filter-status-translated-name'),
  priorityOneCheck: clickable('.t-checkbox-options-ticket-priority input:eq(0)'),
  priorityTwoCheck: clickable('.t-checkbox-list input:eq(1)'),
  statusOneCheck: clickable('.t-checkbox-options-ticket-status input:eq(0)'),
  priorityOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  priorityTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  priorityThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  priorityFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
});
