import Ember from 'ember';

var DTCompleted = Ember.Route.extend({
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  },
});

export default DTCompleted;
