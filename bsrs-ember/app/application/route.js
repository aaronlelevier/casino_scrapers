import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel: function() {
        var store = this.get('store');
        var configuration = $('[data-preload-phonenumber_types]').html();
        var phonenumber_types = JSON.parse(configuration);
        phonenumber_types.forEach(function(model) {
            store.push('phonenumber-type', model);
        });
        return {};
    },
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
