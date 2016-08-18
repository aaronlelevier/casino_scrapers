import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var TicketNewRoute = TabNewRoute.extend({
  repository: inject('ticket'),
  statusRepository: inject('ticket-status'),
  categoryRepository: inject('category'),
  locationRepo: inject('location'),
  priorityRepository: inject('ticket-priority'),
  redirectRoute: 'tickets.index',
  module: 'ticket',
  templateModelField: 'Ticket',
  priorities: Ember.computed(function() {
    return this.get('priorityRepository').fetch();
  }),
  statuses: Ember.computed(function() {
    return this.get('statusRepository').fetch();
  }),
  /* @method model
  * new_pk determined from new_id passed in link-to from grid-head (desktop) and called from findCount function
  */
  model(params) {
    const new_pk = parseInt(params.new_id, 10);
    const statuses = this.get('statuses');
    const priorities = this.get('priorities');
    const repository = this.get('repository');
    let model = this.get('simpleStore').find('ticket', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = repository.create(new_pk);
    }
    return Ember.RSVP.hash({
      model: model,
      statuses: statuses,
      priorities: priorities,
      repository: repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default TicketNewRoute;
