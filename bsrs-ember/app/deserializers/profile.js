import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    if(id) {
      return this.deserializeSingle(response);
    } else {
      return this.deserializeList(response);
    }
  },
  deserializeSingle(model) {
    let store = this.get('simpleStore');
    return this._deserializeSingle(store, 'profile', model);
  },
  deserializeList(response) {
    let store = this.get('simpleStore');
    response.results.forEach((model) => {
      this._deserializeSingle(store, 'profile-list', model);
    });
  },
  _deserializeSingle(store, modelStr, model) {
      model.assignee_id = model.assignee.id;
      return store.push(modelStr, model);
  }
});