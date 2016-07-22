import Ember from 'ember';
import Base from 'bsrs-ember/components/mobile/base';

export default Base.extend({
  simpleStore: Ember.inject.service(),
  actions: {
    changeBool(key) {
      const store = this.get('simpleStore');
      let model = store.find('person', this.get('model.id'));
      model.toggleProperty(key);
    }
  }
});
