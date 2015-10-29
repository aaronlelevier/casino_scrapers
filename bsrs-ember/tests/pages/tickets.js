import PageObject from '../page-object';
let { value, visitable, fillable, clickable, count } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const NEW_URL = BASE_URL + '/new';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const TOPLEVEL = 'select.t-ticket-category-select:eq(0) + .selectize-control';
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

  categoryFillIn: fillable('select.t-ticket-category-select:eq(0) + .selectize-control > .selectize-input input'),
  categoryInput: value('select.t-ticket-category-select:eq(0) > option'),
  categoryClickOptionOne: clickable('select.t-ticket-category-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  categoryClickOptionTwo: clickable('select.t-ticket-category-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  categoryOptionLength: count('select.t-ticket-category-select:eq(0) + .selectize-control > .selectize-dropdown div.option'),

  categoryTwoFillIn: fillable('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-input input'),
  categoryTwoInput: value('select.t-ticket-category-select:eq(1) > option'),
  categoryTwoClickOptionOne: clickable('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  categoryTwoClickOptionTwo: clickable('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  categoryTwoOptionLength: count('select.t-ticket-category-select:eq(1) + .selectize-control > .selectize-dropdown div.option'),

  categoryThreeFillIn: fillable('select.t-ticket-category-select:eq(2) + .selectize-control > .selectize-input input'),
  categoryThreeInput: value('select.t-ticket-category-select:eq(2) > option'),
  categoryThreeClickOptionOne: clickable('select.t-ticket-category-select:eq(2) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  categoryThreeClickOptionTwo: clickable('select.t-ticket-category-select:eq(2) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  categoryThreeOptionLength: count('select.t-ticket-category-select:eq(2) + .selectize-control > .selectize-dropdown div.option'),

  locationFillIn: fillable('select.t-ticket-location-select:eq(0) + .selectize-control > .selectize-input input'),
  locationInput: value('select.t-ticket-location-select:eq(0) > option'),
  locationClickOptionOne: clickable('select.t-ticket-location-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  locationClickOptionTwo: clickable('select.t-ticket-location-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  locationOptionLength: count('select.t-ticket-location-select:eq(0) + .selectize-control > .selectize-dropdown div.option'),

  priorityFillIn: fillable('select.t-ticket-priority-select:eq(0) + .selectize-control > .selectize-input input'),
  priorityInput: value('select.t-ticket-priority-select:eq(0) > option'),
  priorityClickOptionOne: clickable('select.t-ticket-priority-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  priorityClickOptionTwo: clickable('select.t-ticket-priority-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  priorityOptionLength: count('select.t-ticket-priority-select:eq(0) + .selectize-control > .selectize-dropdown div.option'),

  statusFillIn: fillable('select.t-ticket-status-select:eq(0) + .selectize-control > .selectize-input input'),
  statusInput: value('select.t-ticket-status-select:eq(0) > option'),
  statusClickOptionOne: clickable('select.t-ticket-status-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  statusClickOptionTwo: clickable('select.t-ticket-status-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  statusOptionLength: count('select.t-ticket-status-select:eq(0) + .selectize-control > .selectize-dropdown div.option'),

  assigneeFillIn: fillable('select.t-ticket-assignee-select:eq(0) + .selectize-control > .selectize-input input'),
  assigneeInput: value('select.t-ticket-assignee-select:eq(0) > option'),
  assigneeClickOptionOne: clickable('select.t-ticket-assignee-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(0)'),
  assigneeClickOptionTwo: clickable('select.t-ticket-assignee-select:eq(0) + .selectize-control > .selectize-dropdown div.option:eq(1)'),
  assigneeOptionLength: count('select.t-ticket-assignee-select:eq(0) + .selectize-control > .selectize-dropdown div.option'),

  clickSelectizeOption: clickable('.t-ticket-people-select div.option:eq(0)'),
  clickSameCategorySelectizeOption: clickable('.t-ticket-category-select div.option:eq(0)'),

  clickCategorySelectizeOption: clickable(`${TOPLEVEL} > .selectize-dropdown div.option:eq(0)`),
  clickCategorySelectizeSecondOption: clickable(`${TOPLEVEL} > .selectize-dropdown div.option:eq(1)`),
  ticketCategorySelected: count(`${TOPLEVEL} > .selectize-input > div.item`),
  ticketCategoryOptions: count(`${TOPLEVEL} > .selectize-dropdown > .selectize-dropdown-content > div.option`),

  clickCategorySelectizeTwoOption: clickable('select.t-ticket-category-select:eq(1), .selectize-control:eq(1) > .selectize-dropdown div.option:eq(0)'),
  clickCategorySelectizeTwoSecondOption: clickable('select.t-ticket-category-select:eq(1), .selectize-control:eq(1) > .selectize-dropdown div.option:eq(1)'),

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
