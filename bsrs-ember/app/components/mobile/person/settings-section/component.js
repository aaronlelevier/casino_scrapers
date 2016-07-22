import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    changeBool(key) {
      const store = this.get('simpleStore');
      let model = store.find('person', this.get('model.id'));
      model.toggleProperty(key);
    }
  }
});
