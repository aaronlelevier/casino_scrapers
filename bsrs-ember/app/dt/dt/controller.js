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
    linkClick(link, ticket) {
      this.get('ticketRepository').patch(ticket, link).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('store').push('ticket', {id: ticket.id, dtd_fk: response.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket});
      });
    }
  }
});
