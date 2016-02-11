import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

const { run } = Ember;

var extract_attachments = function(model, store) {
    model.attachments.forEach((attachment_id) => {
        store.push('attachment', {id: attachment_id});
    });
    return model.attachments;
};

var extract_categories = function(category_json, store, category_deserializer, ticket) {
    let server_sum = [];
    let to_push = [];
    const category_ids = category_json.mapBy('id');
    const ticket_categories = ticket.get('ticket_categories') || [];
    const ticket_categories_pks = ticket_categories.mapBy('category_pk');
    const ticket_id = ticket.get('id');
    for (let i = category_json.length-1; i >= 0; i--){
        const pk = Ember.uuid();
        const cat = category_json[i];
        cat.previous_children_fks = cat.children_fks;
        let category;
        const existing_category = store.find('category', cat.id);
        if(!existing_category.get('content') || existing_category.get('isNotDirtyOrRelatedNotDirty')){
            category = store.push('category', cat);
            category.save();
        }
        if(Ember.$.inArray(cat.id, ticket_categories_pks) < 0){
            server_sum.push(pk);
            run(() => {
                store.push('ticket-category', {id: pk, ticket_pk: ticket_id, category_pk: cat.id});
            });
        }
    }
    run(() => {
        ticket_categories.forEach((m2m) => {
            if(Ember.$.inArray(m2m.get('category_pk'), category_ids) > -1){
                server_sum.push(m2m.id);
                return;
            }else if(Ember.$.inArray(m2m.get('category_pk'), category_ids) < 0){
               store.push('ticket-category', {id: m2m.get('id'), removed: true}); 
            }
        });
        store.push('ticket', {id: ticket.get('id'), ticket_categories_fks: server_sum.uniq()});
    });
    // model.categories.forEach((category) => {
    //     //find all join models for this ticket
    //     let ticket_categories = all_ticket_categories.filter((m2m) => {
    //         return m2m.get('category_pk') === category.id && m2m.get('ticket_pk') === model.id;
    //     });
    //     //if not in store, setup join models and assign fks to previous children_fks
    //     if(ticket_categories.length === 0) {
    //         const pk = Ember.uuid();
    //         server_sum.push(pk);
    //         run(() => {
    //             store.push('ticket-category', {id: pk, ticket_pk: model.id, category_pk: category.id});  
    //             category.previous_children_fks = category.children_fks;
    //             const check_category = store.find('category', category.id);
    //             if(!check_category.get('content') || check_category.get('isNotDirtyOrRelatedNotDirty')){
    //                 const new_category = store.push('category', category);
    //                 new_category.save();
    //             }
    //         });
    //     }else{
    //         prevented_duplicate_m2m.push(ticket_categories[0].get('id'));
    //     }
    // });
    // server_sum.push(...prevented_duplicate_m2m);
    // let m2m_to_remove = all_ticket_categories.filter((m2m) => {
    //     return Ember.$.inArray(m2m.get('id'), server_sum) < 0 && m2m.get('ticket_pk') === model.id;
    // });
    // m2m_to_remove.forEach((m2m) => {
    //     run(() => {
    //         store.push('ticket-category', {id: m2m.get('id'), removed: true});
    //     });
    // });
    // delete model.categories;
    // return server_sum;
};

var extract_assignee = function(assignee_json, store, ticket_model) {
    let assignee_id = assignee_json.id;
    if(ticket_model.get('assignee.id') !== assignee_id) {
        ticket_model.change_assignee(assignee_json);
        run(() => {
            store.push('ticket', {id: ticket_model.get('id'), assignee_fk: assignee_id});
        });
    }
};

var extract_cc = function(cc_json, store, ticket) {
    let server_sum = [];
    let prevented_duplicate_m2m = [];
    let all_ticket_people = store.find('ticket-person');
    cc_json.forEach((cc) => {
        //find one ticket-person model from store
        let ticket_people = all_ticket_people.filter((m2m) => {
            return m2m.get('person_pk') === cc.id && m2m.get('ticket_pk') === ticket.get('id');
        });
        //push new one in
        if(ticket_people.length === 0) {
            const pk = Ember.uuid();
            server_sum.push(pk);
            run(() => {
                store.push('ticket-person', {id: pk, ticket_pk: ticket.get('id'), person_pk: cc.id});  
            });
            ticket.person_status_role_setup(cc);
        }else{
            //check 
            prevented_duplicate_m2m.push(ticket_people[0].get('id'));
        }
    });
    server_sum.push(...prevented_duplicate_m2m);
    let m2m_to_remove = all_ticket_people.filter((m2m) => {
        return Ember.$.inArray(m2m.get('id'), server_sum) < 0 && m2m.get('ticket_pk') === ticket.get('id');
    });
    m2m_to_remove.forEach((m2m) => {
        store.push('ticket-person', {id: m2m.get('id'), removed: true});
    });
    store.push('ticket', {id: ticket.get('id'), ticket_people_fks: server_sum});
};

var extract_ticket_location = function(model, store, location_deserializer) {
    let location_pk = model.location.id;
    let ticket = store.find('ticket', model.id);
    if (ticket.get('location')) {
        //TODO: use change_location function
        store.push('ticket', {id: ticket.get('id'), location_fk: undefined});
        let location = ticket.get('location');
        if (location) {
            let mutated_array = location.get('tickets').filter((ticket) => {
                return ticket !== model.id;
            });
            run(() => { store.push('location', {id: location.get('id'), tickets: mutated_array}); });
        }
    }
    if(location_pk) {
        let location = store.find('location', model.location.id);
        let existing_tickets = location.get('tickets') || [];
        if (location.get('content') && existing_tickets.indexOf(model.id) === -1) {
            store.push('location', {id: location.get('id'), tickets: existing_tickets.concat(model.id)});
        } else {
            location_deserializer.deserialize(model.location, model.location.id);
            run(() => { store.push('location', {id: location.get('id'), tickets: [model.id]}); });
        }
        delete model.location;
        model.location_fk = location_pk;
    }
    return location_pk;
};

var extract_ticket_priority = function(model, store) {
    let priority_id = model.priority;
    let existing_ticket = store.find('ticket', model.id);
    if (existing_ticket.get('id') && existing_ticket.get('priority.id') !== priority_id) {
        existing_ticket.change_priority(priority_id);
    }

    let new_priority = store.find('ticket-priority', priority_id);
    let new_priority_tickets = new_priority.get('tickets') || [];
    let updated_new_priority_tickets = new_priority_tickets.concat(model.id).uniq();
    store.push('ticket-priority', {id: new_priority.get('id'), tickets: updated_new_priority_tickets});
    delete model.priority;
    return priority_id;
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
        store.push('ticket-status', {id: new_status.get('id'), tickets: updated_new_status_tickets});
    }
    delete model.status;
    return status_id;
};

var TicketDeserializer = Ember.Object.extend({
    PersonDeserializer: injectDeserializer('person'),
    CategoryDeserializer: injectDeserializer('category'),
    LocationDeserializer: injectDeserializer('location'),
    deserialize(response, options) {
        let category_deserializer = this.get('CategoryDeserializer');
        let location_deserializer = this.get('LocationDeserializer');
        if (typeof options === 'undefined') {
            return this.deserialize_list(response, category_deserializer, location_deserializer);
        } else {
            this.deserialize_single(response, options, category_deserializer, location_deserializer);
        }
    },
    deserialize_single(response, id, category_deserializer, location_deserializer) {
        let store = this.get('store');
        let existing_ticket = store.find('ticket', id);
        if (!existing_ticket.get('id') || existing_ticket.get('isNotDirtyOrRelatedNotDirty')) {
            response.status_fk = extract_ticket_status(response, store);
            response.priority_fk = extract_ticket_priority(response, store);
            response.location_fk = extract_ticket_location(response, store, location_deserializer);
            // response.ticket_people_fks = extract_cc(response, store);
            // response.ticket_categories_fks = extract_categories(response, store, category_deserializer);
            let cc_json = response.cc;
            delete response.cc;
            let assignee_json = response.assignee;
            delete response.assignee;
            response.ticket_attachments_fks = extract_attachments(response, store);
            response.previous_attachments_fks = response.ticket_attachments_fks;
            delete response.attachments;
            const categories_json = response.categories;
            delete response.categories;
            response.detail = true;
            let ticket = store.push('ticket', response);
            if (cc_json) {
                extract_cc(cc_json, store, ticket);
            }
            if (assignee_json) {
                extract_assignee(assignee_json, store, ticket);
            }
            extract_categories(categories_json, store, category_deserializer, ticket);
            ticket.save();
        }
    },
    deserialize_list(response, category_deserializer, location_deserializer) {
        let store = this.get('store');
        let return_array = Ember.A();
        response.results.forEach((model) => {
            const existing = store.find('ticket', model.id);
            if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
                model.status_fk = extract_ticket_status(model, store);
                model.priority_fk = extract_ticket_priority(model, store);
                model.location_fk = extract_ticket_location(model, store, location_deserializer);
                let assignee_json = model.assignee;
                //TODO: deserialize test this
                model.assignee_fk = model.assignee.id;
                delete model.assignee;
                const categories_json = model.categories;
                delete model.categories;
                model.grid = true;
                let ticket = store.push('ticket', model);
                extract_assignee(assignee_json, store, ticket);
                extract_categories(categories_json, store, category_deserializer, ticket);
                ticket.save();
                return_array.pushObject(ticket);
            }else{
                return_array.pushObject(existing);
            }
        });
        return return_array;
    }
});

export default TicketDeserializer;





