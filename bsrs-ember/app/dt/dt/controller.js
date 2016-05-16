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
        console.log('controller', 'label: ' + obj.label, 'value: ' + obj.value);
        if(obj.label && obj.value) {
          requestValues.push(`${obj.label}: ${obj.value}`);
        } else if (obj.value) {
          requestValues.push(obj.value);
        }
      }
      console.log('updateRequest: ', requestValues.join(', '));
      this.get('simpleStore').push('ticket', {id: ticket.get('id'), request: requestValues.join(', '), requestValues: requestValues});
    },
    /*
     * @method linkClick 
     * @function dtPathMunge modifies ticket dt_path attribute that sets dt {id: xxx} in json object in order to allow user to have breadcrumbs
     * @param action - send off patch request if action is 'patch', post if action is undefined
     * patch may send current DTD id (bail on existing) or link destination (click button)
     * @param fieldsObj - persist field and option state in dt_path
     */
    linkClick(link, ticket, dtd_model, action, fieldsObj) {
      dtPathMunge(ticket, dtd_model, fieldsObj, this.get('simpleStore'));
      if (action === 'patch') {
        const patch_id = link && link.get('destination.id') || dtd_model.get('id');
        this.get('ticketRepository').patch(ticket, link, patch_id).then((response) => {
          const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
          ticket = this.get('simpleStore').push('ticket', {id: ticket.id, hasSaved: true});
          // if(transition) {
            this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
          // }
        });
      } else {
        this.get('ticketRepository').dtPost(ticket).then((response) => {
          const dtd = this.get('DTDDeserializer').deserialize(response, response.id);
          this.get('simpleStore').push('ticket', {id: ticket.id, hasSaved: true});
          this.transitionToRoute('dt.dt', {id: response.id, model: dtd, ticket: ticket, dt_id: response.id, ticket_id: ticket.id});
        });
      }
    }
  }
});
