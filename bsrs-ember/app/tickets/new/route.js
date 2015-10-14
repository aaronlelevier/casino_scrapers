import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var TicketNewRoute = TabNewRoute.extend({
    repository: inject('ticket'),
    statusRepository: inject('ticket-status'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    //TODO: tab tests say 'New ticket', not 'New Ticket'
    templateModelField: Ember.computed(function() { return 'Ticket'; }),
    model() {
        let repository = this.get('repository');
        let statusRepository = this.get('statusRepository');
        let model = repository.create();
        let statuses = statusRepository.fetch();
        return Ember.RSVP.hash({
            model: model,
            statuses: statuses
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
    }
});

export default TicketNewRoute;
