import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const TOPLEVEL = 'select.t-ticket-category-select:eq(0) + .selectize-control';
const PRIORITY = '.t-ticket-priority-power-select > .ember-basic-dropdown > .ember-power-select-trigger';
const PRIORITY_DROPDOWN = '.t-ticket-priority-power-select-dropdown > .ember-power-select-options';
const LOCATION = 'select.t-ticket-location-select:eq(0) + .selectize-control';
const ASSIGNEE = 'select.t-ticket-assignee-select:eq(0) + .selectize-control';
const CC = 'select.t-ticket-people-select:eq(0) + .selectize-control';
const CATEGORY_ONE = '.t-ticket-category-power-select:eq(0) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_TWO = '.t-ticket-category-power-select:eq(1) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_THREE = '.t-ticket-category-power-select:eq(2) > .ember-basic-dropdown > .ember-power-select-trigger';
const CATEGORY_DROPDOWN = '.t-ticket-category-power-select-dropdown > .ember-power-select-options';
const STATUS = '.t-ticket-status-power-select > .ember-basic-dropdown > .ember-power-select-trigger';
const STATUS_DROPDOWN = '.t-ticket-status-power-select-dropdown > .ember-power-select-options';
const SECONDLEVEL = 'select.t-ticket-category-select:eq(1) + .selectize-control';

var TicketPage = PageObject.build({
  visitNew: visitable(NEW_URL),
  selectizeComponents: count('.t-ticket-category-power-select'),
  firstSelectizeComponent: clickable('select.t-ticket-category-select:eq(0)'),
  secondSelectizeComponent: clickable('select.t-ticket-category-select:eq(1)'),
  thirdSelectizeComponent: clickable('select.t-ticket-category-select:eq(2)'),
  clickFirstSelectizeCategory: clickable('select.t-ticket-category-select:eq(0):parent:div.option:eq(0)'),
  clickSecondSelectizeCategory: clickable('select.t-ticket-category-select:eq(1):parent:div.option:eq(0)'),

  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  subjectInput: value('.t-ticket-subject'),
  subject: fillable('.t-ticket-subject'),

  categoryFillIn: fillable(`${CATEGORY_ONE} > .selectize-input input`),
  categoryInput: value(`select.t-ticket-category-select:eq(0) > option`),

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

  locationFillIn: fillable(`${LOCATION} > .selectize-input input`),
  locationInput: value(`select.t-ticket-location-select:eq(0) > option`),
  locationClickOptionOne: clickable(`${LOCATION} > .selectize-dropdown div.option:eq(0)`),
  locationClickOptionTwo: clickable(`${LOCATION} > .selectize-dropdown div.option:eq(1)`),
  locationOptionLength: count(`${LOCATION} > .selectize-dropdown div.option`),

  priorityFillIn: fillable(`${PRIORITY} > .selectize-input input`),
  priorityInput: text(`${PRIORITY}`),
  priorityClickDropdown: clickable(`${PRIORITY}`),
  priorityClickOptionOne: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityOne})`),
  priorityClickOptionTwo: clickable(`${PRIORITY_DROPDOWN} > .ember-power-select-option:contains(${TICKET_DEFAULTS.priorityTwo})`),
  priorityOptionLength: count(`${PRIORITY} > .selectize-dropdown div.option`),

  statusFillIn: fillable(`${STATUS} > .selectize-input input`),
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
  clickSameCategorySelectizeOption: clickable('.t-ticket-category-select div.option:eq(0)'),

  clickCategorySelectizeOption: clickable(`${TOPLEVEL} > .selectize-dropdown div.option:eq(0)`),
  clickCategorySelectizeSecondOption: clickable(`${TOPLEVEL} > .selectize-dropdown div.option:eq(1)`),
  ticketCategorySelected: count(`${TOPLEVEL} > .selectize-input > div.item`),
  ticketCategoryOptions: count(`${TOPLEVEL} > .selectize-dropdown > .selectize-dropdown-content > div.option`),

  clickCategorySelectizeTwoOption: clickable('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  clickCategorySelectizeTwoSecondOption: clickable('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-dropdown div.option:eq(1)'),

  ticketPeopleSelected: count('.t-ticket-people-select > div.selectize-input > div.item'),
  ticketPeopleOptions: count('.t-ticket-people-select > div.selectize-dropdown-content > div.option'),
  removeTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(0)'),
  removeSecondTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(1)'),
  // ticketSecondLevelCategorySelected: count(`${SECONDLEVEL} > .selectize-input div.item`),
  // ticketSecondLevelCategoryOptions: count(`${SECONDLEVEL} > .selectize-dropdown div.option`),

  locationSelectComponent: clickable(),
});

export default TicketPage;
