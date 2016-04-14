import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import FindById from 'bsrs-ember/mixins/route/findById2';

var DTRoute = Ember.Route.extend(FindById, {
  repository: inject('dtd'),
  ticketRepository: inject('ticket'),
  model(params) {
    const pk = params.dt_id;
    const repository = this.get('repository');
    let ticket = this.get('store').find('ticket', {new_pk: pk}).objectAt(0);
    if(!ticket){
      ticket = this.get('ticketRepository').create(pk);
    } else {
      ticket.set('new_pk', undefined);
    }
    let dtd = repository.fetch(pk);
    return this.findByIdScenario(dtd, pk, {ticket: ticket});
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('ticket', hash.ticket);
  },
  actions: {
    linkClick(destination_id, ticket) {
      if(ticket.get('new_pk')){
        this.get('ticketRepository').insert(ticket).then((response) => {
          //TODO: use response data to determine transition to
          this.transitionTo('dt', destination_id);
        });
      } else {
        this.get('ticketRepository').patch(ticket).then((response) => {
          this.transitionTo('dt', destination_id);
        });
      }
    }
  }
});

export default DTRoute;
