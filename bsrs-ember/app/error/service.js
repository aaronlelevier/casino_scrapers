import Ember from 'ember';

export default Ember.Service.extend({
  msg: '',
  routing: Ember.inject.service('-routing'),
  transToError(route) {
    route = route || 'error';
    this.get('routing').transitionTo(route);
  },
  logErr(msg) {
    this.set('message', msg);
  }
});
