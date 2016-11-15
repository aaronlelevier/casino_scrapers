import Ember from 'ember';
const { run } = Ember;

/**
 * @method belongs_to_extract
 * use extract rather than just change method b/c we do not want to push in the related model if it is the same as what existed locally
 * detail flag is used to differentiate b/w list and detail parent models
 */
var belongs_to_extract = function(type, store, parent_model, ownerName, relatedModelName, collection) {
  // DETAIL: belongs_to_extract(response.priority_fk, store, ticket, 'priority', 'ticket', 'tickets');
  // LIST: belongs_to_extract(status_json, store, ticket, 'status', 'ticket', 'tickets');
  let model;
  if (parent_model.get('detail') && parent_model.get(`${ownerName}.id`) !== type) {
    model = parent_model[`change_${ownerName}`](type);
  } else if (typeof type === 'object') {
    const type_list = store.find(`${relatedModelName}-${ownerName}-list`, type.id);
    const type_arr = type_list.get(`${collection}`) || [];
    const updated_type_arr = type_arr.concat(parent_model.get('id')).uniq();
    const join_model = {id: type.id, name: type.name};
    join_model[`${collection}`] = updated_type_arr;
    run(() =>{
      model = store.push(`${relatedModelName}-${ownerName}-list`, join_model);
    });
  }
  return model;
};

var belongs_to = function(ownerName, relatedModelName) {
  Ember.defineProperty(this, `setup_${ownerName}`, undefined, belongs_to_json(ownerName, relatedModelName));
};

/**
 * Creates many to many setup for deserializer
 *
 * @method belongs_to_json
 * @param ownerName {string} - 'status', 'email'
 * @param relatedModelName {string} - optional 'person' if model name is diff
 */
var belongs_to_json = function(ownerName, relatedModelName) {
  return function(json, model) {
    const store = this.get('simpleStore');
    return belongs_to_extract(json, store, model, ownerName, relatedModelName, this.OPT_CONF[ownerName]['collection']);
  };
};

export { belongs_to_extract, belongs_to };
