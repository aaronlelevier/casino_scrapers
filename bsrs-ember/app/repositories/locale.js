import Ember from 'ember';

export default Ember.Object.extend({
  get_default() {
    const store = this.get('simpleStore');
    return store.find('locale', {
      default: true
    }).objectAt(0);
  }
});