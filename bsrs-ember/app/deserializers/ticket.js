import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var extract_cc = function(model, store, uuid) {
    let server_sum = [];
    let prevented_duplicate_m2m = [];
    let all_ticket_people = store.find('ticket-person');
    model.cc.forEach((cc) => {
        //find one ticket-person model from store
        let ticket_people = all_ticket_people.filter((m2m) => {
            return m2m.get('person_pk') === cc.id && m2m.get('ticket_pk') === model.id;
        });
        //push new one in
        if(ticket_people.length === 0) {
            let pk = uuid.v4();
            server_sum.push(pk);
            store.push('ticket-person', {id: pk, ticket_pk: model.id, person_pk: cc.id});  
            store.push('person', cc);  
        }else{
            //check 
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

var extract_ticket_priority = function(model, store) {
    let priority_id = model.priority;
    let existing_ticket = store.find('ticket', model.id);
    if (existing_ticket.get('id') && existing_ticket.get('priority.id') !== priority_id) {
        existing_ticket.change_priority(priority_id);
    } else {
        let new_priority = store.find('ticket-priority', priority_id);
        let new_priority_tickets = new_priority.get('tickets') || [];
        let updated_new_priority_tickets = new_priority_tickets.concat(model.id).uniq();
        new_priority.set('tickets', updated_new_priority_tickets);
    }
    delete model.priority;
    //TODO: implement dirty tracking and priority_fk in the ticket model @toranb
    // return priority_id;
};

var extract_ticket_status = function(model, store) {
    let status_id = model.status;
    let existing_ticket = store.find('ticket', model.id);
    if (existing_ticket.get('id') && existing_ticket.get('status.id') !== status_id) {
        existing_ticket.change_status(status_id);
    } else {
        let new_status = store.find('ticket-status', status_id);
        let new_status_tickets = new_status.get('tickets') || [];
        let updated_new_status_tickets = new_status_tickets.concat(model.id).uniq();
        new_status.set('tickets', updated_new_status_tickets);
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
            extract_ticket_priority(response, store);
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
                extract_ticket_priority(model, store);
                let ticket = store.push('ticket', model);
                ticket.save();
            }
        });
    }
});

export default TicketDeserializer;





