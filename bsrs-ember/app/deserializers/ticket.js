import Ember from 'ember';
import { belongs_to_extract, belongs_to_extract_nodetail } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract } from 'bsrs-components/repository/many-to-many';

const { run } = Ember;

var extract_attachments = function(model, store) {
    model.attachments.forEach((attachment_id) => {
        store.push('attachment', {id: attachment_id});
    });
    return model.attachments;
};

var extract_assignee = function(assignee_json, store, ticket_model) {
    let assignee_id = assignee_json.id;
    if(ticket_model.get('assignee.id') !== assignee_id) {
        ticket_model.change_assignee(assignee_json);
    }
};

var extract_ticket_location = function(location_json, store, ticket) {
    let location_pk = location_json.id;
    if (ticket.get('location.id') !== location_pk) {
        return [location_pk, location_json];
    }
    return [location_pk];
};

var TicketDeserializer = Ember.Object.extend({
    deserialize(response, options) {
        if (typeof options === 'undefined') {
            this.deserialize_list(response);
        } else {
            return this.deserialize_single(response, options);
        }
    },
    deserialize_single(response, id) {
        let store = this.get('store');
        let existing = store.find('ticket', id);
        let ticket = existing;
        if (!existing.get('id') || existing.get('isNotDirtyOrRelatedNotDirty')) {
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
            ticket = store.push('ticket', response);
            //TODO: only returns one variable
            const [location_fk, ticket_location_json] = extract_ticket_location(location_json, store, ticket);
            belongs_to_extract(response.status_fk, store, ticket, 'status', 'general', 'tickets');
            belongs_to_extract(response.priority_fk, store, ticket, 'priority', 'ticket', 'tickets');
            if (assignee_json) {
                extract_assignee(assignee_json, store, ticket);
            }
            let [m2m_ccs, ccs, cc_server_sum] = many_to_many_extract(cc_json, store, ticket, 'ticket_cc', 'ticket_pk', 'person', 'person_pk');
            let [m2m_categories, categories, server_sum] = many_to_many_extract(categories_json, store, ticket, 'ticket_categories', 'ticket_pk', 'category', 'category_pk');
            run(() => {
                if(ticket_location_json){
                    ticket.change_location(ticket_location_json);
                }
                categories.forEach((cat) => {
                    const children_json = cat.children;
                    delete cat.children;
                    const category = store.push('category', cat); 
                    if(children_json){
                        let [m2m_children, children, server_sum] = many_to_many_extract(children_json, store, category, 'category_children', 'category_pk', 'category', 'child_pk');
                        children.forEach((cat) => {
                            store.push('category', cat); 
                        });
                        m2m_children.forEach((m2m) => {
                            store.push('category-children', m2m);
                        });
                        store.push('category', {id: cat.id, category_children_fks: server_sum}); 
                    }
                });
                m2m_categories.forEach((m2m) => {
                    store.push('ticket-category', m2m);
                });
                ccs.forEach((cc) => {
                    store.push('person', cc); 
                });
                m2m_ccs.forEach((m2m) => {
                    store.push('ticket-person', m2m);
                });
                ticket = store.push('ticket', {id: response.id, ticket_people_fks: cc_server_sum, ticket_categories_fks: server_sum}); 
                ticket.save();
            });
        }
        return ticket;
    },
    deserialize_list(response) {
        const store = this.get('store');
        response.results.forEach((model) => {
            const category_json = model.categories;
            model.category_ids = category_json.mapBy('id');
            category_json.forEach((category) => {
                //TODO: test this
                store.push('category-list', category); 
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
            belongs_to_extract(status_json, store, ticket, 'status', 'general', 'tickets');
            belongs_to_extract(priority_json, store, ticket, 'priority', 'ticket', 'tickets');
            belongs_to_extract_nodetail(assignee_json, store, ticket, 'person', 'tickets');
            belongs_to_extract_nodetail(location_json, store, ticket, 'location', 'tickets');
        });
    }
});

export default TicketDeserializer;





