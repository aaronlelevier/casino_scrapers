import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById';

var DTRoute = Ember.Route.extend(FindById, {
  repository: inject('dtd'),
  ticketRepository: inject('ticket'),
  model(params) {
    const pk = params.dt_id;
    const ticket_id = params.ticket_id;
    const repository = this.get('repository');
    let ticket = this.get('simpleStore').find('ticket', {new_pk: pk}).objectAt(0);
    if(!ticket){
      ticket = this.get('ticketRepository').create(pk);
    }
    let dtd = repository.fetch(pk);
    if (ticket_id) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        this.get('repository').deepLinkDT(pk, ticket_id).then((model) => {
          resolve({model, ticket});
        });
      });
    }
    return this.findByIdScenario(dtd, pk, {ticket: ticket});
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('ticket', hash.ticket);
  },
});

export default DTRoute;
