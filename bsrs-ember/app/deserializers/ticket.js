import Ember from 'ember';

let extract_ticket_status = (model, store) => {
    let status_id = model.status;
    let existing_ticket = store.find('ticket', model.id);
    if (existing_ticket.get('id') && existing_ticket.get('status.id') !== status_id) {
        existing_ticket.change_status(status_id);
    } else {
        let new_status = store.find('ticket-status', status_id);
        let new_status_tickets = new_status.get('tickets') || [];
        if (new_status_tickets.indexOf(model.id) < 0) {
            new_status.set('tickets', new_status_tickets.concat(model.id));
        }
    }
    delete model.status;
    return status_id;
};

var TicketDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let existing_ticket = store.find('ticket', id);
        if (!existing_ticket.get('id') || existing_ticket.get('isNotDirtyOrRelatedNotDirty')) {
            response.status_fk = extract_ticket_status(response, store);
            let ticket = store.push('ticket', response);
            ticket.save();
        }
    },
    deserialize_list(response) {
        let store = this.get('store');
        response.results.forEach((model) => {
            let existing_ticket = store.find('ticket', model.id);
            if (!existing_ticket.get('id') || existing_ticket.get('isNotDirtyOrRelatedNotDirty')) {
                model.status_fk = extract_ticket_status(model, store);
                let ticket = store.push('ticket', model);
                ticket.save();
            }
        });
    }
});

export default TicketDeserializer;





