import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationRoute = Ember.Route.extend({
  repository: inject('location'),
  model(params) {
    var repository = this.get('repository');
    return repository.find();
  },
  actions: {
    cancel() {
      this.transitionTo('admin.locations');
    },
    new() {
      this.transitionTo('admin.locations.new');
    }
  }
});

export default LocationRoute;
