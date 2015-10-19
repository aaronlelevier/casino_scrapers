import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    repository: inject('ticket'),
    peopleRepo: inject('person'),
    categoryRepository: inject('category'),
    statusRepository: inject('ticket-status'),
    priorityRepository: inject('ticket-priority'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    templateModelField: Ember.computed(function() { return 'subject'; }),
    queryParams: {
        search: {
            refreshModel: true
        },
        search_category: {
            refreshModel: true
        },
    },
    model(params, transition) {
        let pk = params.ticket_id;
        let repository = this.get('repository');
        let statusRepository = this.get('statusRepository');
        let priorityRepository = this.get('priorityRepository');
        let search = transition.queryParams.search;
        let search_category = transition.queryParams.search_category;
        let ticket = repository.fetch(pk);
        let statuses = statusRepository.fetch();
        let priorities = priorityRepository.fetch();

        let ticket_cc_options = [];
        if (search) {  
            let peopleRepo = this.get('peopleRepo');
            ticket_cc_options = peopleRepo.findTicketPeople(search) || [];
            let cc = ticket.get('cc');
            for (let i = 0, length=cc.get('length'); i < length; ++i) {
                ticket_cc_options.pushObject(cc.objectAt(i));
            }
        }

        let categoryRepo = this.get('categoryRepository');
        let ticket_category_options = categoryRepo.findTopLevelCategories() || [];

        if (!ticket.get('length') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            ticket = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            search: search,
            search_category: search_category,
            ticket_cc_options: ticket_cc_options,
            ticket_category_options: ticket_category_options,
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('search', hash.search);
        controller.set('search_category', hash.search_category);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
        controller.set('ticket_category_options', hash.ticket_category_options);
    },
});

export default TicketSingleRoute;

