import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    let store = this.get('simpleStore');
    if (id) {
      return this._deserializeSingle(store, response);
    }
    else {
      return this._deserializeList(store, response);
    }
  },
  _deserializeSingle(store, model) {
    model.assignee_fk = model.assignee.id;
    const assignee = model.assignee;
    store.push('person', {
      id: assignee.id,
      username: assignee.username,
      profiles: [model.id]
    });
    delete model.assignee;
    return store.push('profile', model);
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});