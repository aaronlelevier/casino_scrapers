import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    repository: inject('ticket'),
    peopleRepo: inject('person'),
    locationRepo: inject('location'),
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
        search_location: {
            refreshModel: true
        },
    },
    model(params, transition) {
        let pk = params.ticket_id;
        let repository = this.get('repository');
        let statusRepository = this.get('statusRepository');
        let priorityRepository = this.get('priorityRepository');
        let search = transition.queryParams.search;
        let search_location = transition.queryParams.search_location;
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

        let ticket_location_options = [];
        if (search_location) {  
            let locationRepo = this.get('locationRepo');
            ticket_location_options = locationRepo.findTicket(search_location) || [];
            let location = ticket.get('location');
            ticket_location_options.pushObject(location);
        }

        let categoryRepo = this.get('categoryRepository');
        let top_level_category_options = categoryRepo.findTopLevelCategories() || [];

        if (!ticket.get('length') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            ticket = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            search: search,
            search_location: search_location,
            ticket_cc_options: ticket_cc_options,
            ticket_location_options: ticket_location_options,
            top_level_category_options: top_level_category_options,
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('search', hash.search);
        controller.set('search_location', hash.search_location);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
        controller.set('ticket_location_options', hash.ticket_location_options);
        controller.set('top_level_category_options', hash.top_level_category_options);
    },
});

export default TicketSingleRoute;

