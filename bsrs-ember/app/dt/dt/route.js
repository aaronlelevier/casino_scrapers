import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById';

var DTRoute = Ember.Route.extend(FindById, {
  repository: inject('dtd'),
  ticketRepository: inject('ticket'),
  model(params) {
    const pk = params.dt_id;
    const repository = this.get('repository');
    let ticket = this.get('simpleStore').find('ticket', {new_pk: pk}).objectAt(0);
    if(!ticket){
      ticket = this.get('ticketRepository').create(pk);
    }
    let dtd = repository.fetch(pk);
    return this.findByIdScenario(dtd, pk, {ticket: ticket});
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('ticket', hash.ticket);
  },
});

export default DTRoute;
