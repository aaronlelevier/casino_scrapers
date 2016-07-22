import Ember from 'ember';
import PageObject from 'bsrs-ember/tests/page-object';
import PD from 'bsrs-ember/vendor/defaults/profile';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';

let { value, visitable, fillable, clickable, hasClass, count, text } = PageObject;

const ASSIGNEE = '.t-profile-assignee-select';
const DROPDOWN = options;
const FILTER_SELECT = '.t-filter-selector .ember-basic-dropdown-trigger';

export default PageObject.create({
  descValue: value('.t-ap-description'),
  descFill: fillable('.t-ap-description'),
  descSortText: text('.t-sort-description'),
  descGridOne: text('.t-profile-description:eq(0)'),
  descError: text('.t-ap-description-validation-error'),

  assigneeInput: text(ASSIGNEE),
  assigneeSortText: text('.t-sort-assignee-username'),
  assigneeGridOne: text('.t-profile-assignee-username:eq(0)'),

  filterSectionTitleText: text('.t-filter-section-title'),
  addFilterBtnText: text('.t-add-filter-btn'),
  addFilterBtnClick: clickable('.t-add-filter-btn'),
  removeFilterBtnClick: clickable('.t-del-filter-btn'),

  filterInput: text(FILTER_SELECT),
  filterClickDropdown: clickable(FILTER_SELECT),
  filterClickOne: clickable('.ember-power-select-option:eq(1)', { scope: DROPDOWN }),
  filterTextOne: text('.ember-power-select-option:eq(1)'),

});
