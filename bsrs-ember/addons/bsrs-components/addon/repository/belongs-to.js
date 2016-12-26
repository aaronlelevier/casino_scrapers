import Ember from 'ember';
const { run } = Ember;

/**
 * use extract rather than just change method b/c we do not want to push in the related model if it is the same as what existed locally
 * detail flag is used to differentiate b/w list and detail parent models
 * detail type may be an {Object} (non bootstrapped) or {String} (bootstrapped) id
 * list also accepted. Can only pass 'type' {Object}.  Requires model to have `-list` at the end 
 * @method belongs_to_extract
 * @param related - {String} or {Object} - related model on parent
 * @param store
 * @param {Class} parentModel - hydrated model
 * @param {String} ownerName - ticket belongs to a priority - priority is the owning model
 * @param {String} collection - array storing ids on owning model
 *
 * LIST ONLY -- think about splitting out repo methods for list and detail only
 * @param {String} parentModelName - string of parent model
 */
let belongs_to_extract = function(related, store, parentModel, ownerName, parentModelName, collection) {

  // DETAIL: belongs_to_extract(response.priority_fk, store, ticket, 'priority', 'ticket', 'tickets');
  const checkType = (related && typeof related === 'object') ? related.id : related;
  if (!!related && parentModel.get('detail') && parentModel.get(`${ownerName}.id`) !== checkType) {
    return parentModel[`change_${ownerName}`](related);
    
  // LIST: belongs_to_extract(status_json, store, ticket, 'status', 'ticket', 'tickets');
  } else if (!parentModel.get('detail') && related && typeof related === 'object') {
    const related_list = store.find(`${parentModelName}-${ownerName}-list`, related.id);
    const related_arr = related_list.get(`${collection}`) || [];
    const updated_related_arr = related_arr.concat(parentModel.get('id')).uniq();
    related[`${collection}`] = updated_related_arr;
    run(() =>{
      return store.push(`${parentModelName}-${ownerName}-list`, related);
    });
  }
};

let belongs_to = function(ownerName, parentModelName) {
  Ember.defineProperty(this, `setup_${ownerName}`, undefined, belongs_to_json(ownerName, parentModelName));
};

/**
 * Curries function for deserializer. json and model are passed in at a later time
 * Function also imported and used independent of setup funciton above
 *
 * @method belongs_to_json
 * @param ownerName {string} - 'status', 'email'
 * @param parentModelName {string} - optional 'person' if model name is diff
 */
let belongs_to_json = function(ownerName, parentModelName) {
  return function(json, model) {
    const store = this.get('simpleStore');
    return belongs_to_extract(json, store, model, ownerName, parentModelName, this.OPT_CONF[ownerName]['collection']);
  };
};

export { belongs_to_extract, belongs_to };
