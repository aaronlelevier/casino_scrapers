import Ember from 'ember';
import { create, visitable, clickable } from 'ember-cli-page-object';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import BASEURLS from 'bsrs-ember/utilities/urls';

const PD = PERSON_DEFAULTS.defaults();
const BASE_PEOPLE_URL = BASEURLS.base_people_url;
const PEOPLE_INDEX_URL = `${BASE_PEOPLE_URL}/index`;
const DETAIL_URL = `${BASE_PEOPLE_URL}/${PD.idOne}`;

export default create({
  visit: visitable(PEOPLE_INDEX_URL),
  visitDetail: visitable(DETAIL_URL),
  clickFilterUsername: clickable('.t-filter-username'),
  clickFilterFullname: clickable('.t-filter-fullname'),
  clickFilterTitle: clickable('.t-filter-title'),
  clickFilterStatus: clickable('.t-filter-status-translated-name'),
  clickFilterRole: clickable('.t-filter-role-name'),
  statusOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  statusTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  statusThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  statusFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  statusOneCheck: clickable('.t-checkbox-options-person-status input:eq(0)'),
  statusTwoCheck: clickable('.t-checkbox-options-person-status input:eq(1)'),
  roleOneIsChecked: () => Ember.$('.t-checkbox-list input:eq(0)').is(':checked'),
  roleTwoIsChecked: () => Ember.$('.t-checkbox-list input:eq(1)').is(':checked'),
  roleThreeIsChecked: () => Ember.$('.t-checkbox-list input:eq(2)').is(':checked'),
  roleFourIsChecked: () => Ember.$('.t-checkbox-list input:eq(3)').is(':checked'),
  roleOneCheck: clickable('.t-checkbox-options-person-role input:eq(0)'),
  roleTwoCheck: clickable('.t-checkbox-options-person-role input:eq(1)'),
});
