import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';

var TicketMobileRoute = Ember.Route.extend(FindById, PriorityMixin, StatusMixin, {
  repository: inject('ticket'),
  activityRepository: inject('activity'),
  model(params, transition) {
    const pk = params.ticket_id;
    const repository = this.get('repository');
    let ticket = repository.fetch(pk);
    const statuses = this.get('statuses');
    const priorities = this.get('priorities');
    const hashComponents = [
      {'title': 'Activity', 'component': 'mobile/ticket/activity-section', active: 'active'},
      {'title': 'Details', 'component': 'mobile/ticket/detail-section', active: ''},
      {'title': 'Location', 'component': 'mobile/ticket/location-section', active: ''},
    ];
    const otherXhrs = [this.get('activityRepository').find('ticket', 'tickets', pk)];
    return this.findByIdScenario(ticket, pk, {statuses:statuses, priorities:priorities, repository:repository, hashComponents:hashComponents }, false, otherXhrs);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
    controller.set('activities', hash.otherXhrs[0]);
  },
});

export default TicketMobileRoute;
