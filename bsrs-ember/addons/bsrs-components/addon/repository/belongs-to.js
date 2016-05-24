import Ember from 'ember';
const { run } = Ember;

/*
 * TODO: NEED TO REFACTOR
 */
var belongs_to_extract = function(type, store, parent_model, type_string, parent_string, multiple) {
    // DETAIL: belongs_to_extract(response.priority_fk, store, ticket, 'priority', 'ticket', 'tickets');
    // LIST: belongs_to_extract(status_json, store, ticket, 'status', 'ticket', 'tickets');
    if (parent_model.get('detail') && parent_model.get(`${type_string}.id`) !== type) {
        parent_model[`change_${type_string}`](type);
    }else{
        const type_list = store.find(`${parent_string}-${type_string}-list`, type.id);
        const type_arr = type_list.get(`${multiple}`) || [];
        const updated_type_arr = type_arr.concat(parent_model.get('id')).uniq();
        const join_model = {id: type.id, name: type.name};
        join_model[`${multiple}`] = updated_type_arr;
        run(() =>{ 
            store.push(`${parent_string}-${type_string}-list`, join_model);
        });
    }
};

var belongs_to_extract_nodetail = function(json, store, model, related_str, array_str) {
    const existing = store.find(`${related_str}-list`, json.id);
    const model_related_array = existing.get(`${array_str}`) || [];
    const updated_model_related_array = model_related_array.concat(model.get('id')).uniq();
    const inserted_json = json;
    inserted_json[array_str] = updated_model_related_array;
    run(() =>{ 
        store.push(`${related_str}-list`, inserted_json);
    });
};

var belongs_to_extract_contacts = function(model, store, contact_model_str, contact_type) {
    //model, store, email, emails
    let contact_fks = [];
    let contacts = model[`${contact_type}`] || [];
    contacts.forEach((contact) => {
        contact_fks.push(contact.id);
        contact.model_fk = model.id;
        run(() => {
            store.push(`${contact_model_str}`, contact);
        });
    });
    delete model[`${contact_type}`];
    return contact_fks;
};

export { belongs_to_extract, belongs_to_extract_nodetail, belongs_to_extract_contacts };
