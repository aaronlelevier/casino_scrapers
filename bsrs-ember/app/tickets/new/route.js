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
    templateModelField: Ember.computed(function() { return 'Ticket'; }),
    priorities: Ember.computed(function() {
        return this.get('priorityRepository').fetch();
    }),
    statuses: Ember.computed(function() {
        return this.get('statusRepository').fetch();
    }),
    model(params) {
        const new_pk = parseInt(params.new_id, 10);
        const statuses = this.get('statuses');
        const priorities = this.get('priorities');
        const top_level_category_options = this.get('categoryRepository').findTopLevelCategories() || [];
        let model = this.get('store').find('ticket', {new_pk: new_pk}).objectAt(0);
        if(!model){
            model = this.get('repository').create(new_pk);
        }
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
