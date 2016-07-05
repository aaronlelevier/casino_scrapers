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

  assigneeInput: text(ASSIGNEE),
  assigneeClickDropdown: clickable(ASSIGNEE),
  assigneeClickOptionOne: clickable(`.ember-power-select-option:eq(0)`, { scope: DROPDOWN }),
  assigneeClickOptionTwo: clickable(`.ember-power-select-option:eq(1)`, { scope: DROPDOWN }),
  assigneeOptionLength: count('li', { scope: DROPDOWN }),
});
