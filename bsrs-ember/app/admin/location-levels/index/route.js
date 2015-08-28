import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelIndexRoute = Ember.Route.extend({
  repository: inject('location-level'),
  model(params) {
    var repository = this.get('repository');
    return repository.find();
  },
});

export default LocationLevelIndexRoute;


