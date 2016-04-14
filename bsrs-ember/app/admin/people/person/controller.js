import Ember from 'ember';

var PersonController = Ember.Controller.extend({
  queryParams: ['role_change'],
  role_change: undefined,
});

export default PersonController;

