import Ember from 'ember';
import { create, visitable, fillable, text, value, clickable } from 'ember-cli-page-object';
import { options } from 'bsrs-ember/tests/helpers/power-select-terms';
import BASEURLS, { AUTOMATION_URL, automation_LIST_URL } from 'bsrs-ember/utilities/urls';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';
import CD from 'bsrs-ember/vendor/defaults/criteria';

const BASE_URL = BASEURLS.BASE_AUTOMATION_URL;
const DETAIL_URL = `${BASE_URL}/${AD.idOne}`;
const DROPDOWN = options;
const AF_SELECT_ONE = '.t-automation-pf-select:eq(0) .ember-basic-dropdown-trigger';
const ACTION_TYPE_SELECT_ONE = '.t-automation-action-type-select:eq(0)';
const ACTION_ASSIGNEE_SELECT_ONE = '.t-automation-action-assignee-select:eq(0)';

const EVENTS = '.t-automation-event-select .ember-power-select-multiple-option';

const PRIORITY = '.t-priority-criteria .ember-basic-dropdown-trigger > .ember-power-select-multiple-options';
const PRIORITIES = '.t-priority-criteria .ember-power-select-multiple-option';

const LOCATIONS = '.t-ticket-location-select .ember-power-select-multiple-option';
const CATEGORIES = '.t-ticket-category-select .ember-power-select-multiple-option';
const STATES = '.t-ticket-state-select .ember-power-select-multiple-option';
const COUNTRIES = '.t-ticket-country-select .ember-power-select-multiple-option';

export default create({
  visit: visitable(automation_LIST_URL),
  visitDetail: visitable(DETAIL_URL),
  headerText: text('.t-automation-header'),
  descriptionValue: value('.t-automation-description'),
  descriptionFill: fillable('.t-automation-description'),
  descriptionGridOne: text('.t-automation-description:eq(0)'),
  descriptionSortText: text('.t-sort-description'),

  addFilter: clickable('.t-add-pf-btn'),
  deleteFilter: clickable('.t-del-pf-btn:eq(0)'),
  deleteFilterTwo: clickable('.t-del-pf-btn:eq(1)'),
  filterOneClickDropdown: clickable('.t-automation-pf-select:eq(0) .ember-basic-dropdown-trigger'),
  filterOneClickOptionTwo: clickable(`.ember-power-select-option:contains(${PFD.keyTwo})`, { scope: DROPDOWN }),
  filterOnePriorityOneRemove: clickable('.ember-power-select-multiple-remove-btn', { scope: `${PRIORITIES}:eq(0)` }),

  automationFilterOneText: text('.t-automation-pf-select:eq(0)'),
  automationFilterTwoText: text('.t-automation-pf-select:eq(1)'),
  automationFilterThreeText: text('.t-automation-pf-select:eq(2)'),
  automationFilterFourText: text('.t-automation-pf-select:eq(3)'),

  automationFilterOneInput: text(AF_SELECT_ONE),
  automationFilterOneClickDropdown: clickable(AF_SELECT_ONE),
  automationFilterOneOptionOneText: text('li:eq(0)', { scope: DROPDOWN }),
  automationFilterOneOptionTwoText: text('li:eq(1)', { scope: DROPDOWN }),
  automationFilterOneOptionThreeText: text('li:eq(2)', { scope: DROPDOWN }),

  eventSelectedOne: text(`${EVENTS}:eq(0)`),
  eventSelectedTwo: text(`${EVENTS}:eq(1)`),

  prioritySelectedOne: text(`${PRIORITIES}:eq(0)`),
  prioritySelectedTwo: text(`${PRIORITIES}:eq(1)`),
  priorityClickDropdown: clickable(PRIORITY),

  locationSelectedOne: text(`${LOCATIONS}:eq(0)`),
  categorySelectedOne: text(`${CATEGORIES}:eq(0)`),
  stateSelectedOne: text(`${STATES}:eq(0)`),
  countrySelectedOne: text(`${COUNTRIES}:eq(0)`),

  // actions
  clickAddActionBtn: clickable('.t-add-action-btn'),
  clickDeleteActionBtn: clickable('.t-del-action-btn:eq(0)'),
  clickDeleteActionBtnTwo: clickable('.t-del-action-btn:eq(1)'),

  actionTypeSelectedOne: text(ACTION_TYPE_SELECT_ONE),

  actionAssigneeSelectedOne: text(ACTION_ASSIGNEE_SELECT_ONE),
});
