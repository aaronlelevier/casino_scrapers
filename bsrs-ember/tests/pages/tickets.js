import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count, text } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

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
const CATEGORY_ONE = 'select.t-ticket-category-select:eq(0) + .selectize-control';
const CATEGORY_TWO = 'select.t-ticket-category-select:eq(1) + .selectize-control';
const CATEGORY_THREE = 'select.t-ticket-category-select:eq(2) + .selectize-control';
const STATUS = '.t-ticket-status-power-select > .ember-basic-dropdown > .ember-power-select-trigger';
const STATUS_DROPDOWN = '.t-ticket-status-power-select-dropdown > .ember-power-select-options';
const SECONDLEVEL = 'select.t-ticket-category-select:eq(1) + .selectize-control';

var TicketPage = PageObject.build({
  visitNew: visitable(NEW_URL),
  selectizeComponents: count('select.t-ticket-category-select'),
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
  categoryClickOptionOne: clickable(`${CATEGORY_ONE} > .selectize-dropdown div.option:eq(0)`),
  categoryClickOptionTwo: clickable(`${CATEGORY_ONE} > .selectize-dropdown div.option:eq(1)`),
  categoryOptionLength: count(`${CATEGORY_ONE} > .selectize-dropdown div.option`),

  categoryTwoFillIn: fillable(`${CATEGORY_TWO} > .selectize-input input`),
  categoryTwoInput: value(`select.t-ticket-category-select:eq(1) > option`),
  categoryTwoClickOptionOne: clickable(`${CATEGORY_TWO} > .selectize-dropdown div.option:eq(0)`),
  categoryTwoClickOptionTwo: clickable(`${CATEGORY_TWO} > .selectize-dropdown div.option:eq(1)`),
  categoryTwoOptionLength: count(`${CATEGORY_TWO} > .selectize-dropdown div.option`),

  categoryThreeFillIn: fillable(`${CATEGORY_THREE} > .selectize-input input`),
  categoryThreeInput: value(`select.t-ticket-category-select:eq(2) > option`),
  categoryThreeClickOptionOne: clickable(`${CATEGORY_THREE} > .selectize-dropdown div.option:eq(0)`),
  categoryThreeClickOptionTwo: clickable(`${CATEGORY_THREE} > .selectize-dropdown div.option:eq(1)`),
  categoryThreeOptionLength: count(`${CATEGORY_THREE} > .selectize-dropdown div.option`),

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
  ticketTopLevelCategorySelected: count(`${TOPLEVEL} > .selectize-input div.item`),
  ticketTopLevelCategoryOptions: count(`${TOPLEVEL} > .selectize-dropdown div.option`),
  ticketSecondLevelCategorySelected: count(`${SECONDLEVEL} > .selectize-input div.item`),
  ticketSecondLevelCategoryOptions: count(`${SECONDLEVEL} > .selectize-dropdown div.option`),

  locationSelectComponent: clickable(),
});

export default TicketPage;
