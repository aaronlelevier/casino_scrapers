import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    select(type) {
      const _type = typeof(type) === 'object' ? type.get('id') : type;
      this.get('model').set(this.get('property'), _type);
    },
  }
});
