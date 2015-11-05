import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const PRIORITY = '.t-ticket-priority-power-select > .ember-basic-dropdown > .ember-power-select-trigger';
const PRIORITY_DROPDOWN = '.t-ticket-priority-power-select-dropdown > .ember-power-select-options';
const LOCATION = '.t-ticket-location-select > .ember-basic-dropdown > .ember-power-select-trigger';
const LOCATION_DROPDOWN = '.t-ticket-location-select-dropdown > .ember-power-select-options';
const ASSIGNEE = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
const CC = 'select.t-ticket-people-select:eq(0) + .selectize-control';
const CATEGORY_ONE = '.t-ticket-category-power-select:eq(0) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_TWO = '.t-ticket-category-power-select:eq(1) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_THREE = '.t-ticket-category-power-select:eq(2) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_DROPDOWN = '.t-ticket-category-power-select-dropdown > .ember-power-select-options';
const STATUS = '.t-ticket-status-power-select > .ember-basic-dropdown > .ember-power-select-trigger';
const STATUS_DROPDOWN = '.t-ticket-status-power-select-dropdown > .ember-power-select-options';

var TicketPage = PageObject.build({
  visitNew: visitable(NEW_URL),

  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  subjectInput: value('.t-ticket-subject'),
  subject: fillable('.t-ticket-subject'),

  selectizeComponents: count('.t-ticket-category-power-select'),
  categoryOneClickDropdown: clickable(`${CATEGORY_ONE}`),
  categoryOneInput: text(`${CATEGORY_ONE}`),
  categoryOneClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameOne})`),
  categoryOneClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameThree})`),
  categoryOneOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryTwoInput: text(`${CATEGORY_TWO}`),
  categoryTwoClickDropdown: clickable(`${CATEGORY_TWO}`),
  categoryTwoClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameTwo})`),
  categoryTwoClickOptionTwo: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameUnused})`),
  categoryTwoClickOptionPlumbing: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameRepairChild})`),
  categoryTwoClickOptionElectrical: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameTwo})`),
  categoryTwoClickOptionSecurity: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameLossPreventionChild})`),
  categoryTwoOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  categoryThreeInput: text(`${CATEGORY_THREE}`),
  categoryThreeClickDropdown: clickable(`${CATEGORY_THREE}`),
  categoryThreeClickOptionOne: clickable(`${CATEGORY_DROPDOWN} > .ember-power-select-option:contains(${CATEGORY_DEFAULTS.nameElectricalChild})`),
  categoryThreeOptionLength: count(`${CATEGORY_DROPDOWN} > li`),

  // locationFillIn: fillable(`${LOCATION} > .selectize-input input`),
  // locationInput: value(`select.t-ticket-location-select:eq(0) > option`),
  // locationClickOptionOne: clickable(`${LOCATION} > .selectize-dropdown div.option:eq(0)`),
  // locationClickOptionTwo: clickable(`${LOCATION} > .selectize-dropdown div.option:eq(1)`),
  // locationOptionLength: count(`${LOCATION} > .selectize-dropdown div.option`),

  locationInput: text(`${LOCATION}`),
  locationClickDropdown: clickable(`${LOCATION}`),
  locationClickOptionOne: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LOCATION_DEFAULTS.storeName})`),
  locationClickOptionTwo: clickable(`${LOCATION_DROPDOWN} > .ember-power-select-option:contains(${LOCATION_DEFAULTS.storeNameTwo})`),
  locationOptionLength: count(`${LOCATION_DROPDOWN} > li`),

  priorityInput: text(`${PRIORITY}`),
  priorityClickDropdown: clickable(`${PRIORITY}`),
  priorityClickOptionOne: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityOne})`),
  priorityClickOptionTwo: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityTwo})`),
  priorityOptionLength: count(`${PRIORITY} > .selectize-dropdown div.option`),

  statusInput: text(`${STATUS}`),
  statusClickDropdown: clickable(`${STATUS}`),
  statusClickOptionOne: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.statusOne})`),
  statusClickOptionTwo: clickable(`${STATUS_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.statusTwo})`),
  statusOptionLength: count(`${STATUS} > .selectize-dropdown div.option`),

  assigneeFillIn: fillable(`${ASSIGNEE} > .selectize-input input`),
  assigneeInput: value(`select.t-ticket-assignee-select:eq(0) > option`),
  assigneeClickOptionOne: clickable(`${ASSIGNEE} > .selectize-dropdown div.option:eq(0)`),
  assigneeClickOptionTwo: clickable(`${ASSIGNEE} > .selectize-dropdown div.option:eq(1)`),
  assigneeOptionLength: count(`${ASSIGNEE} > .selectize-dropdown div.option`),

  clickSelectizeOption: clickable('.t-ticket-people-select div.option:eq(0)'),

  ticketPeopleSelected: count('.t-ticket-people-select > div.selectize-input > div.item'),
  ticketPeopleOptions: count('.t-ticket-people-select > div.selectize-dropdown-content > div.option'),
  removeTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(0)'),
  removeSecondTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(1)'),

  locationSelectComponent: clickable(),
});

export default TicketPage;
