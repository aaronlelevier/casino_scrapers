import Ember from 'ember';
import injectDeserializer from 'bsrs-ember/utilities/deserializer';

const { run } = Ember;

var extract_attachments = function(model, store) {
    model.attachments.forEach((attachment_id) => {
        store.push('attachment', {id: attachment_id});
    });
    return model.attachments;
};

var extract_categories_list = function(category_json, store, category_deserializer, ticket) {
    let server_sum = [];
    let m2m_categories = [];
    let categories = [];
    const category_ids = category_json.mapBy('id');
    const ticket_categories = ticket.get('ticket_categories_no_filter') || [];
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
    location_json.grid = true;
    if (ticket.get('location.id') !== location_pk) {
        return [location_pk, location_json];
    }
    return [location_pk];
};

var extract_ticket_priority = function(priority_id, store, ticket) {
    if (ticket.get('id') && ticket.get('priority.id') !== priority_id) {
        ticket.change_priority(priority_id);
    }else{
        let priority = store.find('ticket-priority', priority_id);
        let priority_tickets = priority.get('tickets') || [];
        let updated_priority_tickets = priority_tickets.concat(ticket.get('id')).uniq();
        return {id: priority.get('id'), tickets: updated_priority_tickets};
    }
};

var extract_ticket_status = function(status_id, store, ticket) {
    if (ticket.get('id') && ticket.get('status.id') !== status_id) {
        ticket.change_status(status_id);
    } else {
        let status = store.find('ticket-status', status_id);
        let status_tickets = status.get('tickets') || [];
        let updated_status_tickets = status_tickets.concat(ticket.get('id')).uniq();
        return {id: status.get('id'), tickets: updated_status_tickets};
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
            return this.deserialize_list(response, category_deserializer, location_deserializer);
        } else {
            this.deserialize_single(response, options, category_deserializer, location_deserializer);
        }
    },
    deserialize_single(response, id, category_deserializer) {
        let store = this.get('store');
        let existing_ticket = store.find('ticket', id);
        let m2m_categories = [];
        let categories = [];
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
            const status = extract_ticket_status(response.status_fk, store, ticket);
            const priority = extract_ticket_priority(response.priority_fk, store, ticket);
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
                if(priority){ store.push('ticket-priority', priority); }
                if(status){ store.push('ticket-status', status); }
                const pushed_ticket = store.push('ticket', {id: response.id, ticket_categories_fks: server_sum}); 
                pushed_ticket.save();
            });
        }
    },
    deserialize_list(response, category_deserializer) {
        let store = this.get('store');
        let return_array = Ember.A();
        let m2m_categories = [];
        let categories = [];
        let server_sum;
        let location_fk;
        let ticket_location_json;
        let tickets = [];
        let priorities = [];
        let statuses = [];
        let location_jsons = [];
        response.results.forEach((model) => {
            const existing = store.find('ticket', model.id);
            let category_ids;
            if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
                let location_json = model.location;
                model.location_fk = location_json.id;
                delete model.location;
                let assignee_json = model.assignee;
                //TODO: deserialize test this
                model.assignee_fk = model.assignee.id;
                delete model.assignee;
                const categories_json = model.categories;
                delete model.categories;
                model.grid = true;
                let ticket = store.push('ticket', model);
                [location_fk, ticket_location_json] = extract_ticket_location(location_json, store, ticket);
                if(ticket_location_json){
                    location_jsons.push({ticket: ticket, json: ticket_location_json});
                }
                priorities.push(extract_ticket_priority(model.priority_fk, store, ticket));
                statuses.push(extract_ticket_status(model.status_fk, store, ticket));
                extract_assignee(assignee_json, store, ticket);
                let categories_arr;
                let m2m_categories_arr;
                [m2m_categories_arr, categories_arr, server_sum, category_ids] = extract_categories_list(categories_json, store, category_deserializer, ticket);
                categories.push(...categories_arr);
                m2m_categories.push(...m2m_categories_arr);
                return_array.pushObject(ticket);
            }else{
                return_array.pushObject(existing);
            }
            tickets.push({id: model.id, ticket_categories_fks: server_sum, location_fk: location_fk, category_ids: category_ids}); 
        });
        run(() => {
            tickets.forEach((ticket) => {
                const pushed_ticket = store.push('ticket', ticket); 
                pushed_ticket.save();
            });
            location_jsons.forEach((obj) => {
                obj['ticket'].change_location(obj['json']); 
            });
            categories.forEach((cat) => {
                store.push('category', cat); 
            });
            m2m_categories.forEach((m2m) => {
                store.push('ticket-category', m2m);
            });
            priorities.forEach((priority) => {
                if(priority){ store.push('ticket-priority', priority); }
            });
            statuses.forEach((status) => {
                if(status){ store.push('ticket-status', status); }
            });
        });
        return return_array;
    }
});

export default TicketDeserializer;





