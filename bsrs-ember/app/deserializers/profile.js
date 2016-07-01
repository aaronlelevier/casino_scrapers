import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    if(id) {
      return this.deserializeSingle(response);
    } else {
      return this.deserializeList(response);
    }
  },
  deserializeSingle(response) {
    return this.get('simpleStore').push('profile', response);
  },
  deserializeList(response) {
    let store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('profile-list', model);
    });
  }
});