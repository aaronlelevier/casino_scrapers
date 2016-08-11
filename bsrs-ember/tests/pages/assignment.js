import Ember from 'ember';
import { create, visitable, fillable, text, value, clickable } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { ASSIGNMENT_URL, ASSIGNMENT_LIST_URL } from 'bsrs-ember/utilities/urls';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';

const BASE_URL = BASEURLS.BASE_ASSIGNMENT_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const ASSIGNEE = '.t-assignment-assignee-select';
const DROPDOWN = options;
const PRIORITY = '.t-priority-criteria .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const PRIORITIES = '.t-priority-criteria .ember-power-select-multiple-option';
const LOCATIONS = '.t-ticket-location-select .ember-power-select-multiple-option';

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

  addFilter: clickable('.t-add-pf-btn'),
  deleteFilter: clickable('.t-del-pf-btn:eq(0)'),
  deleteFilterTwo: clickable('.t-del-pf-btn:eq(1)'),
  filterOneClickDropdown: clickable('.t-assignment-pf-select:eq(0) .ember-basic-dropdown-trigger'),
  // filterOneClickOptionOne: clickable(`.ember-power-select-option:contains(${PFD.keyOne})`, { scope: DROPDOWN }),
  filterOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${PFD.keyTwo})`, { scope: DROPDOWN }),
  filterOnePriorityOneRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: `${PRIORITIES}:eq(0)` }),

  prioritySelectedOne: text(`${PRIORITIES}:eq(0)`),
  prioritySelectedTwo: text(`${PRIORITIES}:eq(1)`),
  priorityClickDropdown: clickable(PRIORITY),
  priorityClickTwo: clickable(`.ember-power-select-option:contains(${TD.priorityTwoKey})`, { scope: DROPDOWN }),

  locationSelectedOne: text(`${LOCATIONS}:eq(0)`),
});
