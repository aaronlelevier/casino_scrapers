import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var TicketSingleRoute = TabRoute.extend({
    activityRepository: inject('activity'),
    repository: inject('ticket'),
    locationRepo: inject('location'),
    categoryRepository: inject('category'),
    statusRepository: inject('ticket-status'),
    priorityRepository: inject('ticket-priority'),
    attachmentRepository: inject('attachment'),
    transitionCallback() { this.get('attachmentRepository').removeAllUnrelated(); },
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    templateModelField: Ember.computed(function() { return 'subject'; }),
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
        let ticket = repository.fetch(pk);
        const statuses = this.get('statuses');
        const priorities = this.get('priorities');
        const top_level_category_options = this.get('top_level_category_options');
        if (!ticket.get('content') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            //NOTE: if not dirty on search change, then will bring in new data
            ticket = repository.findById(pk);
        }
        let activities = this.get('activityRepository').find('ticket', 'tickets', pk);
        return {
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            top_level_category_options: top_level_category_options,
            activities: activities
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('top_level_category_options', hash.top_level_category_options);
        controller.set('activities', hash.activities);
    },
});

export default TicketSingleRoute;

