import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller, error) {
    Ember.Logger.debug(error);
  },
});
