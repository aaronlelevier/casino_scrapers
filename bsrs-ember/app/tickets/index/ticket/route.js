import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';

export default Ember.Route.extend(FindById, PriorityMixin, {
  repository: inject('ticket'),
  statusRepository: inject('ticket-status'),
  activityRepository: inject('activity'),
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
    controller.setProperties(hash);
  },
});
