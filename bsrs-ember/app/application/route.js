import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        return {};
    }
  //need to figure out how to output errors on screen
  // actions: {
  //   //application error resource -- still not working; default route defined with wildcard in router
  //   error: function(error) {
  //     this.transitionTo('application-error', error);
  //   }
  // }
});
