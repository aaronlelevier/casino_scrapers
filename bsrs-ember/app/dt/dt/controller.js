import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import dtPathMunge from 'bsrs-ember/utilities/dt-path-munge';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  ticketRepository: inject('ticket'),
  DTDDeserializer: injectDeserializer('dtd'),
  actions: {
    /*
     * updatRequest 
     * updates ticket request based on fieldsObj (Map) that holds the current value for a field
     */
    updateRequest(fieldsObj, ticket) {
      let requestValues = [];
      const objs = fieldsObj.values();
      for (var obj of objs) {
        /* jshint ignore:start */
        obj.label ? requestValues.push(`${obj.label}: ${obj.value}`) : requestValues.push(obj.value);
        /* jshint ignore:end */
      }
      this.get('simpleStore').push('ticket', {id: ticket.get('id'), request: requestValues.join(', '), requestValues: requestValues});
    },
    /*
     * modifies ticket dt_path attribute
     * send off patch request
     */
    linkClick(destination_id, link, ticket, dtd_id) {
      dtPathMunge(ticket, dtd_id, this.get('simpleStore'));
      this.get('ticketRepository').patch(destination_id, ticket, link).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('simpleStore').push('ticket', {id: ticket.id, dtd_fk: response.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket});
      });
    }
  }
});
