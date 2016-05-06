import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

var dtPathMunge = function(ticket, dtd, simpleStore) {
  const dt_id = dtd ? dtd.get('id') : undefined;
  const dt_path = [{
    ticket: {
      id: ticket.get('id'),
      requester: ticket.get('requester'),
      location: ticket.get('location.id'),
      status: ticket.get('status.id'),
      priority: ticket.get('priority.id'),
      request: ticket.get('request'),
      categories: ticket.get('categories_ids'),
      cc: ticket.get('cc_ids'),
      attachments: ticket.get('attachment_ids')
    },
    dt_id: dt_id
  }];
  simpleStore.push('ticket', {id: ticket.get('id'), dt_path: dt_path});
};

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
      dtPathMunge(ticket, null, this.get('simpleStore'));
      this.get('ticketRepository').dtPost(ticket).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('simpleStore').push('ticket', {id: ticket.id, dtd_fk: response.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket});
      });
    }
  }
});
