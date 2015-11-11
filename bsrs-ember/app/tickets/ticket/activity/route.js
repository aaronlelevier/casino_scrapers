import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TicketActivity = Ember.Route.extend({
    repository: inject('activity'),
    model() {
        const pk = this.modelFor('tickets.ticket').model.get('id');
        return this.get('repository').find('ticket', 'tickets', pk);
    }
});

export default TicketActivity;

