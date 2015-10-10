import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    repository: inject('ticket'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    templateModelField: Ember.computed(function() { return 'number'; }),
    model(params) {
        let pk = params.ticket_id;
        let repository = this.get('repository');
        let ticket = this.get('store').find('ticket', pk);
        if (!ticket.get('length') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            ticket = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: ticket,
            repository: repository
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('repository', hash.repository);
    },
});

export default TicketSingleRoute;

