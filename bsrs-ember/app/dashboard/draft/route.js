import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

let PREFIX = config.APP.NAMESPACE;
let TICKETS_URL = `${PREFIX}/tickets/`;

let TicketsDraftRoute = GridViewRoute.extend({
  repository: inject('ticket'),
  personCurrent: Ember.inject.service('person-current'),
  special_url: Ember.computed(function() {
    const person = this.get('personCurrent').get('model').get('person');
    const status = this.get('simpleStore').find('ticket-status').filter(status => status.get('name') === 'ticket.status.draft');
    return `status=${status[0].get('id')}&assignee=${person.get('id')}`;
  }),
});

export default TicketsDraftRoute;
