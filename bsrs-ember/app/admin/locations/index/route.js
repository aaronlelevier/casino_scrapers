import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationIndexRoute = Ember.Route.extend({
  repository: inject('location'),
  model(params) {
    var repository = this.get('repository');
    return repository.find();
  },
});

export default LocationIndexRoute;
