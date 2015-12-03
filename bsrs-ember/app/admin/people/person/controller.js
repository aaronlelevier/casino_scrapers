import Ember from 'ember';

var PersonController = Ember.Controller.extend({
    queryParams: ['search', 'role_change'],
    search: undefined,
    role_change: undefined,
});

export default PersonController;

