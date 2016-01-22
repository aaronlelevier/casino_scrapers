import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard

var TicketSingleRoute = TabRoute.extend({
    activityRepository: inject('activity'),
    repository: inject('ticket'),
    locationRepo: inject('location'),
    categoryRepository: inject('category'),
    statusRepository: inject('ticket-status'),
    priorityRepository: inject('ticket-priority'),
    attachmentRepository: inject('attachment'),
    transitionCallback() { this.get('attachmentRepository').removeAllUnrelated(); },
    /*start-non-standard*/ @computed /*end-non-standard*/
    redirectRoute() { return 'tickets.index'; },
    /*start-non-standard*/ @computed /*end-non-standard*/
    modelName() { return 'ticket'; },
    /*start-non-standard*/ @computed /*end-non-standard*/
    templateModelField() { return 'categories'; },
    /*start-non-standard*/ @computed /*end-non-standard*/
    top_level_category_options() {
        const categoryRepo = this.get('categoryRepository');
        return categoryRepo.findTopLevelCategories();
    },
    /*start-non-standard*/ @computed /*end-non-standard*/
    priorities() {
        return this.get('priorityRepository').fetch();
    },
    /*start-non-standard*/ @computed /*end-non-standard*/
    statuses() {
        return this.get('statusRepository').fetch();
    },
    model(params, transition) {
        const pk = params.ticket_id;
        const repository = this.get('repository');
        let ticket = repository.fetch(pk);
        const statuses = this.get('statuses');
        const priorities = this.get('priorities');
        if (!ticket.get('content') || ticket.get('isNotDirtyOrRelatedNotDirty')) { 
            //NOTE: if not dirty on search change, then will bring in new data
            ticket = repository.findById(pk);
        }
        let activities = this.get('activityRepository').find('ticket', 'tickets', pk);
        return {
            model: ticket,
            statuses: statuses,
            priorities: priorities,
            activities: activities
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('activities', hash.activities);
    },
});

export default TicketSingleRoute;

