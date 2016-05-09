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
     * @method updatRequest 
     * updates ticket request based on fieldsObj (Map) that holds the current value for a field
     * checkbox needs to update value based on if checked, not option value
     */
    updateRequest(fieldsObj, ticket) {
      let requestValues = [];
      const objs = fieldsObj.values();
      for (var obj of objs) {
        /* jshint ignore:start */
        if(obj.label && obj.value) {
          requestValues.push(`${obj.label}: ${obj.value}`);
        } else if (obj.value) {
          requestValues.push(obj.value);
        }
        /* jshint ignore:end */
      }
      this.get('simpleStore').push('ticket', {id: ticket.get('id'), request: requestValues.join(', '), requestValues: requestValues});
    },
    /*
     * @method linkClick 
     * modifies ticket dt_path attribute
     * send off patch request
     */
    linkClick(destination_id, link, ticket, dtd_id) {
      dtPathMunge(ticket, dtd_id, this.get('simpleStore'));
      this.get('ticketRepository').patch(destination_id, ticket, link).then((response) => {
        const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
        ticket = this.get('simpleStore').push('ticket', {id: ticket.id, dtd_fk: response.id});
        this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
      });
    }
  }
});
