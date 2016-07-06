import Ember from 'ember';

export default Ember.Object.extend({
  deserialize(response, id) {
    return this.get('simpleStore').push('tenant', response);
  }
});