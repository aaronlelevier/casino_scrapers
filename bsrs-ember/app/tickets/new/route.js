import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var TicketNewRoute = TabNewRoute.extend({
    repository: inject('ticket'),
    statusRepository: inject('ticket-status'),
    categoryRepository: inject('category'),
    priorityRepository: inject('ticket-priority'),
    redirectRoute: Ember.computed(function() { return 'tickets.index'; }),
    modelName: Ember.computed(function() { return 'ticket'; }),
    //TODO: tab tests say 'New ticket', not 'New Ticket'
    templateModelField: Ember.computed(function() { return 'Ticket'; }),
    model() {
        let repository = this.get('repository');
        let statusRepository = this.get('statusRepository');
        let priorityRepository = this.get('priorityRepository');
        let model = repository.create();
        let statuses = statusRepository.fetch();
        let priorities = priorityRepository.fetch();
        let categoryRepo = this.get('categoryRepository');
        let top_level_category_options = categoryRepo.findTopLevelCategories() || [];
        return Ember.RSVP.hash({
            model: model,
            statuses: statuses,
            priorities: priorities,
            top_level_category_options: top_level_category_options,
        });
        //child select -that fires the model hook (here) by updating the selected
        //model push DOWN to the "manager" component these pks
        //the mgr component build a tree of these categories IN ORDER
        //the mgr components hbs -we simply #each over the categories (in order -left to right)
        //<ticket-category-select options? ticket=ticket>
        //?options? can the service turn these out?
        //
        //1) click repair (top level)
        //2) we ask django for children (of repair)
        //3) next they click maintenance (middle)
        //4) we ask django for children of maint
        //5) next we click plumb
        //6) we ask django but get empty set of children back :)
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('top_level_category_options', hash.top_level_category_options);
    }
});

export default TicketNewRoute;
