import Ember from 'ember';

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  classNames: ['t-checkbox-list'],
  filterModels: Ember.computed(function() {
    const field = this.get('column.filterModelName');
    const store = this.get('simpleStore');
    return store.find(field);
  }),
});
