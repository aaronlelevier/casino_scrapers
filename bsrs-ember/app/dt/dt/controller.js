import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';
import dtPathMunge from 'bsrs-ember/utilities/dt-path-munge';

export default Ember.Controller.extend({
  repository: inject('ticket'),
  ticketRepository: inject('ticket'),
  DTDDeserializer: injectDeserializer('dtd'),
  TicketDeserializer: injectDeserializer('ticket'),
  actions: {
    /*
     * @method updateRequest 
     * updates ticket request based on fieldsObj (Map) that holds the current value for a field
     * checkbox needs to update value based on if checked, not option value
     * fieldsObj will contain any existing request values from deep linked dt (setup in init of dtd-preview)
     * need to update existing obj if on existing dtd (go back and change a field to update ticket)
     */
    updateRequest(fieldsObj, ticket) {
      let requestValues = [];
      const objs = fieldsObj.values();
      for (var obj of objs) {
        if(obj.label && obj.value) {
          requestValues.push(`${obj.label}: ${obj.value}`);
        } else if (obj.value) {
          requestValues.push(obj.value);
        }
      }
      this.get('simpleStore').push('ticket', {id: ticket.get('id'), request: requestValues.join(', '), requestValues: requestValues});
    },
    /*
     * @method linkClick 
     * @function dtPathMunge modifies ticket dt_path attribute that sets dt {id: xxx} in json object in order to allow user to have breadcrumbs
     * @param action - send off patch request if action is 'patch', post if action is undefined
     * patch may send current DTD id (bail on existing) or link destination (click button) (patch_id); post always goes to next dtd based on link dest id
     * @param fieldsObj - persist field and option state in dt_path
     */
    linkClick(link, ticket, dtd_model, action, fieldsObj) {
      dtPathMunge(ticket, dtd_model, fieldsObj, link, this.get('simpleStore'));
      if (action === 'patch') {
        //TODO: remove link &&
        const patch_id = link && link.get('destination.id') || dtd_model.get('id');
        if (link.get('destination.id')) {
          this.get('ticketRepository').patch(ticket, link, patch_id).then((response) => {
            const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
            // TODO: what does hasSaved do?
            ticket = this.get('simpleStore').push('ticket', {id: ticket.get('id'), hasSaved: true});
            this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
          });
        } else {
          this.get('ticketRepository').submit(ticket, link).then((ticket_server) => {
            const returned_ticket = this.get('TicketDeserializer').deserialize(ticket_server, ticket_server.id);
            this.transitionToRoute('dt.completed', {ticket_id: returned_ticket.get('id'), ticket: returned_ticket});
          });
        }
      } else {
        this.get('ticketRepository').dtPost(ticket, link).then((response) => {
          const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
          this.get('simpleStore').push('ticket', {id: ticket.id, hasSaved: true});
          this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
        });
      }
    }
  }
});
