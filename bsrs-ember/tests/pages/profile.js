import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import PD from 'bsrs-ember/vendor/defaults/profile';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;

const ASSIGNEE = '.t-profile-assignee-select > .ember-basic-dropdown-trigger';
const DROPDOWN = options;

export default PageObject.create({
  descValue: value('.t-ap-description'),
  descFill: fillable('.t-ap-description'),
  descSortText: text('.t-sort-description'),
  descGridOne: text('.t-profile-description:eq(0)'),
  descGridTwo: text('.t-profile-description:eq(1)'),

  assigneeInput: text(ASSIGNEE),
  assigneeSortText: text('.t-sort-assignee-username'),
  assigneeGridOne: text('.t-profile-assignee-username:eq(0)'),
  assigneeGridTwo: text('.t-profile-assignee-username:eq(1)'),
});
