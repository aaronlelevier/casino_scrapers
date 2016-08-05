import Ember from 'ember';

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  priorities: Ember.computed(function() {
    return this.get('simpleStore').find('ticket-priority');
  })
});
