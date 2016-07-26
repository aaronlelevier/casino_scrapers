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

var belongs_to = function(_ownerName, modelName, relatedModelName) {
  Ember.defineProperty(this, `setup_${_ownerName}`, undefined, belongs_to_json(modelName, _ownerName, relatedModelName));
};

/**
 * Creates many to many setup for deserializer
 *
 * @method belongs_to_json
 */
var belongs_to_json = function(modelName, _ownerName, relatedModelName) {
  return function(json, model) {
    const store = this.get('simpleStore');
    belongs_to_extract(json, store, model, _ownerName, relatedModelName, this.OPT_CONF[_ownerName]['collection']);
  };
};

export { belongs_to_extract, belongs_to_extract_contacts, belongs_to };
