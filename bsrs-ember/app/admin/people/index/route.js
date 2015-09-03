import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var PersonIndexRoute = Ember.Route.extend({
  repository: inject('person'),
  model: function(params, transition) {
    var query_params = transition.queryParams;
    var repository = this.get('repository');
    var model = repository.find();
    return Ember.RSVP.hash({
        model: model,
        search: query_params.search
    });
  },
  setupController: function(controller, hash) {
      controller.set('model', hash.model);
      controller.set('search', hash.search);
  },
  // actions: {
  //   cancel() {
  //     this.transitionTo('admin.people');
  //   },
  //   new() {
  //     this.transitionTo('admin.people.new');
  //   }
  // }
});

export default PersonIndexRoute;
