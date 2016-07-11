import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var PREFIX = config.APP.NAMESPACE;
var TICKETS_URL = `${PREFIX}/tickets/`;

var TicketsNewRoute = GridViewRoute.extend({
  repository: inject('ticket'),
  personCurrent: Ember.inject.service(),
  special_url: Ember.computed(function() {
    const person = this.get('personCurrent').get('model').get('person');
    const status = this.get('simpleStore').find('ticket-status').filter(status => status.get('name') === 'ticket.status.new')
    return `status=${status[0].get('id')}&assignee=${person.get('id')}`;
  }),
});

export default TicketsNewRoute;
