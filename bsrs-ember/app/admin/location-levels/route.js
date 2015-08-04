import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelRoute = Ember.Route.extend({
  repository: inject('location-level'),
  model(params) {
    var repository = this.get('repository');
    return repository.find();
  },
  // actions: {
  //   cancel() {
  //     this.transitionTo('admin.locations-levels');
  //   },
  //   new() {
  //     this.transitionTo('admin.locations-levels.new');
  //   }
  // }
});

export default LocationLevelRoute;

