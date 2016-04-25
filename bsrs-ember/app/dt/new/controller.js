import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  ticketRepository: inject('ticket'),
  DTDDeserializer: injectDeserializer('dtd'),
  isNotValid: Ember.computed('ticket.requester', 'ticket.location', function(){
    let ticket = this.get('ticket');
    return !Boolean(ticket.get('requester') && ticket.get('location.id'));
  }),
  actions: {
    start(ticket) {
      this.get('ticketRepository').dtPost(ticket).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('store').push('ticket', {id: ticket.id, dtd_fk: response.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket});
      });
    }
  }
});
