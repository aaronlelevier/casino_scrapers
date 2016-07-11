import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import config from 'bsrs-ember/config/environment';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

var PREFIX = config.APP.NAMESPACE;
var TICKETS_URL = `${PREFIX}/tickets/`;

var TicketsInProgressRoute = GridViewRoute.extend({
  repository: inject('ticket'),
  personCurrent: Ember.inject.service(),
  special_url: Ember.computed(function() {
    const person = this.get('personCurrent').get('model').get('person');
    return `assignee=${person.get('id')}`;
  }),
});

export default TicketsInProgressRoute;
