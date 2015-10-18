import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    repository: inject('ticket'),
    peopleRepo: inject('person'),
    statusRepository: inject('ticket-status'),
    priorityRepository: inject('ticket-priority'),
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
        let statusRepository = this.get('statusRepository');
        let priorityRepository = this.get('priorityRepository');
        let search = transition.queryParams.search;
        let ticket = repository.fetch(pk);
        let statuses = statusRepository.fetch();
        let priorities = priorityRepository.fetch();
        let peopleRepo = this.get('peopleRepo');
        let ticket_cc_options = search ? peopleRepo.findTicketPeople(search) : [];
        if (!ticket.get('length') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            ticket = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            search: search,
            ticket_cc_options: ticket_cc_options
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('search', hash.search);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
    },
});

export default TicketSingleRoute;

