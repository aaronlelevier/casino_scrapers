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
       * ensures ticket hasSaved flag is false since Ticket create will happen after filling out start page
       */
      this.get('dtdRepository').getStart().then((response) => {
      // this.get('ticketRepository').dtPost(ticket).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        // dtPathMunge(ticket, dtd, this.get('simpleStore'));
        ticket = this.get('simpleStore').push('ticket', {id: ticket.id, hasSaved: false});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
      });
    }
  }
});
