import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    const store = this.get('simpleStore');
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
    delete model.assignee;
    const pfilters = model.filters;
    delete model.filters;
    let profile = store.push('profile', model);
    profile.change_assignee(assignee);
    pfilters.forEach((obj) => {
      const criteria_fks = obj.criteria;
      delete obj.criteria;
      obj.criteria_fks = criteria_fks;
      store.push('pfilter', obj);
      profile.add_pf({id: obj.id});
    });
    return profile;
  },
  _deserializeList(store, response) {
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});
