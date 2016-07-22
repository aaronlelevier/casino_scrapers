import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['mobile-inner'],
  simpleStore: Ember.inject.service(),
  actions: {
    changeBool(key) {
      const store = this.get('simpleStore');
      let model = store.find('person', this.get('model.id'));
      model.toggleProperty(key);
    }
  }
});
