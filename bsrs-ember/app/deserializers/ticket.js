import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

let extract_cc = (model, store, uuid) => {
    let server_sum = [];
    let prevented_duplicate_m2m = [];
    let all_ticket_people = store.find('ticket-person');
    model.cc.forEach((cc) => {
        let ticket_people = all_ticket_people.filter((m2m) => {
            return m2m.get('person_pk') === cc.id && m2m.get('ticket_pk') === model.id;
        });
        if(ticket_people.length === 0) {
            let pk = uuid.v4();
            server_sum.push(pk);
            store.push('ticket-person', {id: pk, ticket_pk: model.id, person_pk: cc.id});  
            store.push('person', cc);  
        }else{
            prevented_duplicate_m2m.push(ticket_people[0].get('id'));
        }
    });
    server_sum.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_ticket_people.filter((m2m) => {
        return Ember.$.inArray(m2m.get('id'), server_sum) < 0;
    });
    m2m_to_remove.forEach((m2m) => {
        store.push('ticket-person', {id: m2m.get('id'), removed: true});
    });
    delete model.cc;
    return server_sum;
};

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
    uuid: inject('uuid'),
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let uuid = this.get('uuid');
        let store = this.get('store');
        let existing_ticket = store.find('ticket', id);
        if (!existing_ticket.get('id') || existing_ticket.get('isNotDirtyOrRelatedNotDirty')) {
            response.status_fk = extract_ticket_status(response, store);
            response.ticket_people_fks = extract_cc(response, store, uuid);
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





