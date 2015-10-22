import PageObject from '../page-object';
let { visitable, fillable, clickable, count } = PageObject;
import config from 'bsrs-ember/config/environment';
import BASEURLS from 'bsrs-ember/tests/helpers/urls';
import TICKET_DEFAULTS from 'bsrs-ember/vendor/defaults/ticket';

const PREFIX = config.APP.NAMESPACE;
const BASE_URL = BASEURLS.base_tickets_url;
const TICKETS_URL = BASE_URL + '/index';
const TICKET_NEW_URL = BASE_URL + '/new';

var TicketPage = PageObject.build({
  visit: visitable(TICKETS_URL),
  visitNew: visitable(TICKET_NEW_URL),
  clickCategorySelectizeOption: clickable('.t-ticket-category-select div.option:eq(1)'),
});

export default TicketPage;
