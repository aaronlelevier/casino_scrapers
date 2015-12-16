import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var TicketNewRoute = TabNewRoute.extend({
    repository: inject('ticket'),
    statusRepository: inject('ticket-status'),
    categoryRepository: inject('category'),
    locationRepo: inject('location'),
    priorityRepository: inject('ticket-priority'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    //TODO: tab tests say 'New ticket', not 'New Ticket'
    templateModelField: Ember.computed(function() { return 'Ticket'; }),
    priorities: Ember.computed(function() {
        return this.get('priorityRepository').fetch();
    }),
    statuses: Ember.computed(function() {
        return this.get('statusRepository').fetch();
    }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        let model = this.get('model_fetch');
        let statuses = this.get('statuses');
        let priorities = this.get('priorities');
        let categoryRepo = this.get('categoryRepository');
        let top_level_category_options = categoryRepo.findTopLevelCategories() || [];

        return {
            model: model,
            statuses: statuses,
            priorities: priorities,
            top_level_category_options: top_level_category_options,
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('top_level_category_options', hash.top_level_category_options);
    }
});

export default TicketNewRoute;
