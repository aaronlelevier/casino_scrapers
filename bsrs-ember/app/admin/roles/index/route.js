import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

let RolesIndexRoute = Ember.Route.extend({
  repository: inject('role'),
  model(params) {
    var repository = this.get('repository');
    return repository.find();
  },
});

export default RolesIndexRoute;
