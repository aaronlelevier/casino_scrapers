import Ember from 'ember';
import { create, visitable, fillable, text, value } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL } from 'bsrs-ember/utilities/urls';
import AD from 'bsrs-ember/vendor/defaults/assignment';

const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const ASSIGNEE = '.t-assignment-assignee-select';

export default create({
  visit: visitable(ASSIGNMENT_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  descriptionValue: value('.t-assignment-description'),
  descriptionFill: fillable('.t-assignment-description'),
  descriptionGridOne: text('.t-assignment-description:eq(0)'),
  descriptionSortText: text('.t-sort-description'),

  assigneeInput: text(ASSIGNEE),
  assigneeSortText: text('.t-sort-assignee-fullname'),
  assigneeGridOne: text('.t-assignment-assignee-fullname:eq(0)'),
});
