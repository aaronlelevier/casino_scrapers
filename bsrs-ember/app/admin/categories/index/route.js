import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategoriesIndexRoute = Ember.Route.extend({
  repository: inject('category'),
  model: function(params) {
    var repository = this.get('repository');
    var model = repository.find();
    return Ember.RSVP.hash({
        model: model,
    });
  },
  setupController: function(controller, hash) {
      controller.set('model', hash.model);
  },
  // actions: {
  //   cancel() {
  //     this.transitionTo('admin.categories');
  //   },
  //   new() {
  //     this.transitionTo('admin.categories.new');
  //   }
  // }
});

export default CategoriesIndexRoute;
