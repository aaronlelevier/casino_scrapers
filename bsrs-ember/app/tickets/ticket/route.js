import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    repository: inject('ticket'),
    peopleRepo: inject('person'),
    statusRepository: inject('ticket-status'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    templateModelField: Ember.computed(function() { return 'subject'; }),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model(params, transition) {
        let pk = params.ticket_id;
        let repository = this.get('repository');
        let search = transition.queryParams.search;
        let store = this.get('store');
        let ticket = store.find('ticket', pk);
        let statuses = this.get('statusRepository').fetch();
        let priorities = this.get('store').find('ticket-priority');
        let peopleRepo = this.get('peopleRepo');
        let ticket_cc_options = search ? peopleRepo.find(search) : [];
        if (!ticket.get('length') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            ticket = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: ticket,
            repository: repository,
            statuses: statuses,
            priorities: priorities,
            search: search,
            ticket_cc_options: ticket_cc_options
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('repository', hash.repository);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('search', hash.search);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
    },
});

export default TicketSingleRoute;

