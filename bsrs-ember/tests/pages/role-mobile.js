import Ember from 'ember';
import {
  create,
  visitable,
  clickable
} from 'ember-cli-page-object';

export default create({
  visit: visitable('/'),
  clickFilterName: clickable('.t-filter-name'),
  clickFilterRoleType: clickable('.t-filter-role-type'),

  roleTypeOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  roleTypeTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  roleTypeOneCheck: clickable('.t-checkbox-options-role-type input:eq(0)'),
});
