import PageObject from '../page-object';
let { visitable, fillable } = PageObject;
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
  subject: fillable('.t-ticket-subject'),
  priority: fillable('.t-ticket-priority'),
  status: fillable('.t-ticket-status'),
});

export default TicketPage;
