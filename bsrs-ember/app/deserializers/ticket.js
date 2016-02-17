import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

const { run } = Ember;

var extract_attachments = function(model, store) {
    model.attachments.forEach((attachment_id) => {
        store.push('attachment', {id: attachment_id});
    });
    return model.attachments;
};

// var extract_categories_list = function(category_json, store, category_deserializer, ticket) {
//     let server_sum = [];
//     let m2m_categories = [];
//     let categories = [];
//     const category_ids = category_json.mapBy('id');
//     const ticket_categories = ticket.get('ticket_categories_no_filter') || [];
//     const ticket_categories_pks = ticket_categories.mapBy('category_pk');
//     const ticket_id = ticket.get('id');
//     for (let i = category_json.length-1; i >= 0; i--){
//         const pk = Ember.uuid();
//         const cat = category_json[i];
//         cat.previous_children_fks = cat.children_fks;
//         const existing_category = store.find('category', cat.id);
//         if(!existing_category.get('content')){
//             categories.push(cat);
//         }
//         if(Ember.$.inArray(cat.id, ticket_categories_pks) < 0){
//             server_sum.push(pk);
//             m2m_categories.push({id: pk, ticket_pk: ticket_id, category_pk: cat.id});
//         }
//     }
//     ticket_categories.forEach((m2m) => {
//         if(Ember.$.inArray(m2m.get('category_pk'), category_ids) > -1){
//             server_sum.push(m2m.id);
//             return;
//         }else if(Ember.$.inArray(m2m.get('category_pk'), category_ids) < 0){
//            m2m_categories.push({id: m2m.get('id'), removed: true});
//         }
//     });
//     return [m2m_categories, categories, server_sum, category_ids];
// };

var extract_categories = function(category_json, store, category_deserializer, ticket) {
    let server_sum = [];
    let m2m_categories = [];
    let categories = [];
    const category_ids = category_json.mapBy('id');
    const ticket_categories = ticket.get('ticket_categories') || [];
    const ticket_categories_pks = ticket_categories.mapBy('category_pk');
    const ticket_id = ticket.get('id');
    for (let i = category_json.length-1; i >= 0; i--){
        const pk = Ember.uuid();
        const cat = category_json[i];
        cat.previous_children_fks = cat.children_fks;
        const existing_category = store.find('category', cat.id);
        if(!existing_category.get('content')){
            categories.push(cat);
        }
        if(Ember.$.inArray(cat.id, ticket_categories_pks) < 0){
            server_sum.push(pk);
            m2m_categories.push({id: pk, ticket_pk: ticket_id, category_pk: cat.id});
        }
    }
    ticket_categories.forEach((m2m) => {
        if(Ember.$.inArray(m2m.get('category_pk'), category_ids) > -1){
            server_sum.push(m2m.id);
            return;
        }else if(Ember.$.inArray(m2m.get('category_pk'), category_ids) < 0){
           m2m_categories.push({id: m2m.get('id'), removed: true});
        }
    });
    return [m2m_categories, categories, server_sum, category_ids];
};

var extract_assignee = function(assignee_json, store, ticket_model) {
    let assignee_id = assignee_json.id;
    if(ticket_model.get('assignee.id') !== assignee_id) {
        ticket_model.change_assignee(assignee_json);
    }
};

var extract_assignee_list = function(assignee_json, store, ticket) {
    const existing_person = store.find('person-list', assignee_json.id);
    const person_tickets = existing_person.get('tickets') || [];
    const updated_person_tickets = person_tickets.concat(ticket.get('id')).uniq();
    store.push('person-list', {id: assignee_json.id, first_name: assignee_json.first_name, last_name: assignee_json.last_name, tickets: updated_person_tickets});
};

var extract_location_list = function(location_json, store, ticket) {
    const existing_location = store.find('location-list', location_json.id);
    const location_tickets = existing_location.get('tickets') || [];
    const updated_location_tickets = location_tickets.concat(ticket.get('id')).uniq();
    store.push('location-list', {id: location_json.id, name: location_json.name, tickets: updated_location_tickets});
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

var extract_ticket_location = function(location_json, store, ticket) {
    let location_pk = location_json.id;
    if (ticket.get('location.id') !== location_pk) {
        return [location_pk, location_json];
    }
    return [location_pk];
};

var extract_ticket_priority = function(priority, store, ticket) {
    if (ticket.get('detail') && ticket.get('priority.id') !== priority) {
        ticket.change_priority(priority);
    }else{
        const priority_list = store.find('ticket-priority-list', priority.id);
        const priority_tickets = priority_list.get('tickets') || [];
        const updated_priority_tickets = priority_tickets.concat(ticket.get('id')).uniq();
        store.push('ticket-priority-list', {id: priority.id, name: priority.name, tickets: updated_priority_tickets});
    }
};

var extract_ticket_status = function(status, store, ticket) {
    if (ticket.get('detail') && ticket.get('status.id') !== status) {
        ticket.change_status(status);
    }else{
        const status_list = store.find('ticket-status-list', status.id);
        const status_tickets = status_list.get('tickets') || [];
        const updated_status_tickets = status_tickets.concat(ticket.get('id')).uniq();
        store.push('ticket-status-list', {id: status.id, name: status.name, tickets: updated_status_tickets});
    }
};

var TicketDeserializer = Ember.Object.extend({
    PersonDeserializer: injectDeserializer('person'),
    CategoryDeserializer: injectDeserializer('category'),
    LocationDeserializer: injectDeserializer('location'),
    deserialize(response, options) {
        let category_deserializer = this.get('CategoryDeserializer');
        let location_deserializer = this.get('LocationDeserializer');
        if (typeof options === 'undefined') {
            return this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options, category_deserializer, location_deserializer);
        }
    },
    deserialize_single(response, id, category_deserializer) {
        let store = this.get('store');
        let existing_ticket = store.find('ticket', id);
        let m2m_categories = [];
        let categories = [];
        let return_ticket = existing_ticket;
        if (!existing_ticket.get('id') || existing_ticket.get('isNotDirtyOrRelatedNotDirty')) {
            let location_json = response.location;
            response.location_fk = location_json.id;
            delete response.location;
            let cc_json = response.cc;
            delete response.cc;
            let assignee_json = response.assignee;
            response.assignee_fk = response.assignee ? response.assignee.id : undefined;
            delete response.assignee;
            response.ticket_attachments_fks = extract_attachments(response, store);
            response.previous_attachments_fks = response.ticket_attachments_fks;
            delete response.attachments;
            const categories_json = response.categories;
            delete response.categories;
            response.detail = true;
            let ticket = store.push('ticket', response);
            const [location_fk, ticket_location_json] = extract_ticket_location(location_json, store, ticket);
            extract_ticket_status(response.status_fk, store, ticket);
            extract_ticket_priority(response.priority_fk, store, ticket);
            //TODO: do I need these if statements
            if (cc_json) {
                extract_cc(cc_json, store, ticket);
            }
            if (assignee_json) {
                extract_assignee(assignee_json, store, ticket);
            }
            let categories_arr;
            let server_sum;
            [m2m_categories, categories_arr, server_sum] = extract_categories(categories_json, store, category_deserializer, ticket);
            categories.push(...categories_arr);
            run(() => {
                if(ticket_location_json){
                    ticket.change_location(ticket_location_json);
                }
                categories.forEach((cat) => {
                    store.push('category', cat); 
                });
                m2m_categories.forEach((m2m) => {
                    store.push('ticket-category', m2m);
                });
                // if(priority){ store.push('ticket-priority', priority); }
                // if(status){ store.push('ticket-status', status); }
                const pushed_ticket = store.push('ticket', {id: response.id, ticket_categories_fks: server_sum}); 
                pushed_ticket.save();
            });
            return_ticket = ticket;
        }
        return return_ticket;
    },
    deserialize_list(response) {
        const store = this.get('store');
        const return_array = [];
        response.results.forEach((model) => {
            const category_json = model.categories;
            model.category_ids = category_json.mapBy('id');
            category_json.forEach((category) => {
                store.push('category', category); 
            });
            const location_json = model.location;
            model.location_fk = model.location.id;
            const assignee_json = model.assignee;
            model.assignee_fk = model.assignee.id;
            delete model.categories;
            delete model.location;
            delete model.assignee;
            delete model.location;
            const status_json = model.status;
            delete model.status;
            const priority_json = model.priority;
            delete model.priority;
            const ticket = store.push('ticket-list', model);
            ticket.save();
            extract_ticket_priority(priority_json, store, ticket);
            extract_ticket_status(status_json, store, ticket);
            extract_assignee_list(assignee_json, store, ticket);
            extract_location_list(location_json, store, ticket);
            return_array.push(ticket);
        });
        return return_array;
    }
});

export default TicketDeserializer;





