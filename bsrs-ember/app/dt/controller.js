import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  ticketRepository: inject('ticket'),
  DTDDeserializer: injectDeserializer('dtd'),
  actions: {
    updateRequest(value, label, ticket) {
      const requestValues = ticket.get('requestValues') || [];
      /* jshint ignore:start */
      const labelPlusVal = `${label}: ${value}`;
      requestValues.includes(labelPlusVal) ? requestValues.removeObject(labelPlusVal) : requestValues.pushObject(labelPlusVal);
      /* jshint ignore:end */
      //TODO: if no label
      this.get('store').push('ticket', {id: ticket.get('id'), request: requestValues.join(', '), requestValues: requestValues});
    },
    linkClick(destination_id, ticket) {
      if(ticket.get('new_pk')){
        this.get('ticketRepository').dtPost(ticket, destination_id).then((response) => {
          const { id } = response;
          this.get('DTDDeserializer').deserialize(response, id);
          this.transitionToRoute('dt', destination_id);
        });
      } else {
        this.get('ticketRepository').patch(ticket, destination_id).then((response) => {
          const { id } = response;
          this.get('DTDDeserializer').deserialize(response, id);
          this.transitionToRoute('dt', id);
        });
      }
    }
  }
});
