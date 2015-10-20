import PageObject from '../page-object';
let { visitable, fillable, clickable, count } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const DETAIL_URL = BASE_URL + '/' + TICKET_DEFAULTS.idOne;

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
  clickCategorySelectizeOption: clickable('.t-ticket-category-select div.option:eq(1)'),
  ticketPeopleSelected: count('.t-ticket-people-select > div.selectize-input > div.item'),
  ticketPeopleOptions: count('.t-ticket-people-select > div.selectize-dropdown-content > div.option'),
  removeTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(0)'),
  removeSecondTicketPeople: clickable('.t-ticket-people-select > div.selectize-input > div.item > a.remove:eq(1)'),
  ticketCategorySelected: count('.t-ticket-category-select > div.selectize-input > div.item'),
  ticketCategoryOptions: count('.t-ticket-category-select > div.selectize-dropdown-content > div.option'),
  removeTicketCategory: clickable('.t-ticket-category-select > div.selectize-input > div.item > a.remove:eq(0)'),
  removeSecondTicketCategory: clickable('.t-ticket-category-select > div.selectize-input > div.item > a.remove:eq(1)'),
});

export default TicketPage;
