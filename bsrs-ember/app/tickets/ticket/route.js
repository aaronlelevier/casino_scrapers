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
        search_assignee: {
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
        let search = transition.queryParams.search;
        let search_location = transition.queryParams.search_location;
        let search_assignee = transition.queryParams.search_assignee;
        let ticket = repository.fetch(pk);
        let statuses = this.get('statuses');
        let priorities = this.get('priorities');

        let top_level_category_options = this.get('top_level_category_options');

        let ticket_assignee_options = [];
        ticket_assignee_options = peopleRepo.findTicketAssignee(search_assignee) || [];
        let assignee = ticket.get('assignee');
        if (assignee) {
            ticket_assignee_options.pushObject(assignee);
        }

        let ticket_cc_options = [];
        ticket_cc_options = peopleRepo.findTicketPeople(search) || [];
        let cc = ticket.get('cc') || [];
        for (let i = 0, length=cc.get('length'); i < length; ++i) {
            ticket_cc_options.pushObject(cc.objectAt(i));
        }

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
        return Ember.RSVP.hash({
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            search: search,
            search_location: search_location,
            search_assignee: search_assignee,
            ticket_cc_options: ticket_cc_options,
            ticket_assignee_options: ticket_assignee_options,
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
        controller.set('search_assignee', hash.search_assignee);
        controller.set('ticket_cc_options', hash.ticket_cc_options);
        controller.set('ticket_assignee_options', hash.ticket_assignee_options);
        controller.set('ticket_location_options', hash.ticket_location_options);
        controller.set('top_level_category_options', hash.top_level_category_options);
    },
});

export default TicketSingleRoute;

