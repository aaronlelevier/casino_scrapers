import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    activityRepository: inject('activity'),
    repository: inject('ticket'),
    peopleRepo: inject('person'),
    locationRepo: inject('location'),
    categoryRepository: inject('category'),
    statusRepository: inject('ticket-status'),
    priorityRepository: inject('ticket-priority'),
    attachmentRepository: inject('attachment'),
    transitionCallback: function() { this.get('attachmentRepository').removeAllUnrelated(); },
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    templateModelField: Ember.computed(function() { return 'subject'; }),
    queryParams: {
        search_cc: {
            refreshModel: true
        },
        search_location: {
            refreshModel: true
        },
    },
    top_level_category_options: Ember.computed(function() {
        const categoryRepo = this.get('categoryRepository');
        return categoryRepo.findTopLevelCategories();
    }),
    priorities: Ember.computed(function() {
        return this.get('priorityRepository').fetch();
    }),
    statuses: Ember.computed(function() {
        return this.get('statusRepository').fetch();
    }),
    model(params, transition) {
        const pk = params.ticket_id;
        const repository = this.get('repository');
        const peopleRepo = this.get('peopleRepo');
        let search_cc = transition.queryParams.search_cc;
        let search_location = transition.queryParams.search_location;
        let ticket = repository.fetch(pk);
        let statuses = this.get('statuses');
        let priorities = this.get('priorities');

        let top_level_category_options = this.get('top_level_category_options');

        let ticket_cc_options = peopleRepo.findTicketPeople(search_cc);

        let ticket_location_options = [];
        let locationRepo = this.get('locationRepo');
        ticket_location_options = locationRepo.findTicket(search_location) || [];
        let location = ticket.get('location');
        if (location) {
            ticket_location_options.push(location);
        }

        if (!ticket.get('content') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            //NOTE: if not dirty on search change, then will bring in new data
            ticket = repository.findById(pk);
        }

        let activities = this.get('activityRepository').find('ticket', 'tickets', pk);

        return Ember.RSVP.hash({
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            search_cc: search_cc,
            search_location: search_location,
            ticket_cc_options: ticket_cc_options,
            ticket_location_options: ticket_location_options,
            top_level_category_options: top_level_category_options,
            activities: activities
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('search_cc', hash.search_cc);
        controller.set('search_location', hash.search_location);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
        controller.set('ticket_location_options', hash.ticket_location_options);
        controller.set('top_level_category_options', hash.top_level_category_options);
        controller.set('activities', hash.activities);
    },
});

export default TicketSingleRoute;

