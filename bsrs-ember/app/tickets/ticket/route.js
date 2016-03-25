import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
//start-non-standard
import computed from 'ember-computed-decorators';
//end-non-standard

var TicketSingleRoute = TabRoute.extend(FindById, PriorityMixin, {
    activityRepository: inject('activity'),
    repository: inject('ticket'),
    locationRepo: inject('location'),
    categoryRepository: inject('category'),
    statusRepository: inject('ticket-status'),
    attachmentRepository: inject('attachment'),
    transitionCB() { this.get('attachmentRepository').removeAllUnrelated(); },
    /*start-non-standard*/ @computed /*end-non-standard*/
    redirectRoute() { return 'tickets.index'; },
    /*start-non-standard*/ @computed /*end-non-standard*/
    module() { return 'ticket'; },
    /*start-non-standard*/ @computed /*end-non-standard*/
    templateModelField() { return 'categories'; },
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
        let activities = this.get('activityRepository').find('ticket', 'tickets', pk);
        return this.findByIdScenario(ticket, pk, {statuses:statuses, priorities:priorities, activities:activities });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('statuses', hash.statuses);
        controller.set('priorities', hash.priorities);
        controller.set('activities', hash.activities);
    },
});

export default TicketSingleRoute;

