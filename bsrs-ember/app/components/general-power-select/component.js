import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    select(type) {
      this.get('model').set(this.get('property'), type);
    },
  }
});
