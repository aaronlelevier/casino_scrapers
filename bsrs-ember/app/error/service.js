import Ember from 'ember';

export default Ember.Service.extend({
  routing: Ember.inject.service('-routing'),
  transToError() {
    this.get('routing').transitionTo('error');
  }
});
