import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
// import dtPathMunge from 'bsrs-ember/utilities/dt-path-munge';

export default Ember.Controller.extend({
  ticketRepository: inject('ticket'),
  dtdRepository: inject('dtd'),
  DTDDeserializer: injectDeserializer('dtd'),
  isNotValid: Ember.computed('ticket.requester', 'ticket.location', function(){
    let ticket = this.get('ticket');
    return !Boolean(ticket.get('requester') && ticket.get('location.id'));
  }),
  actions: {
    start(ticket) {
      /*
       * @method start
       * sends of get request to get the start page
       * ensures action is undefined to call POST method in linkClick in dt/dt/controller
       */
      this.get('dtdRepository').getStart().then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('simpleStore').push('ticket', {id: ticket.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
      });
    }
  }
});
