import PageObject from '../page-object';
let { visitable, fillable, clickable } = PageObject;
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
  clickSelectizeOption: clickable('.t-ticket-people-select div.option:eq(0)')
});

export default TicketPage;
