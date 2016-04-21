import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  ticketRepository: inject('ticket'),
  DTDDeserializer: injectDeserializer('dtd'),
  actions: {
    start(ticket) {
      this.get('ticketRepository').dtPost(ticket).then((response) => {
        const dtd = response;
        this.get('DTDDeserializer').deserialize(dtd, dtd.id);
        this.get('store').push('ticket', {id: ticket.id, new_pk: dtd.id});
        this.transitionToRoute('dt.dt', dtd);
      });
    }
  }
});
