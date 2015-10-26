import PageObject from '../page-object';
let { visitable, fillable, clickable, count } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;
const TOPLEVEL = 'select.t-ticket-category-select:eq(0) + .selectize-control';
const SECONDLEVEL = 'select.t-ticket-category-select:eq(1) + .selectize-control';

var TicketPage = PageObject.build({
  visit: visitable(TICKETS_URL),
  visitDetail: visitable(DETAIL_URL),
  subjectInput: PageObject.value('.t-ticket-subject'),
  subject: fillable('.t-ticket-subject'),
  priority: fillable('.t-ticket-priority'),
  priorityInput: PageObject.value('.t-ticket-priority'),
  status: fillable('.t-ticket-status'),
  statusInput: PageObject.value('.t-ticket-status'),
  clickSelectizeOption: clickable('.t-ticket-people-select div.option:eq(0)'),
  clickSameCategorySelectizeOption: clickable('.t-ticket-category-select div.option:eq(0)'),
  selectizeComponents: count('select.t-ticket-category-select'),

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
