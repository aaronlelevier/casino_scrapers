import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationNewRoute = TabRoute.extend({
  repository: inject('location'),
  redirectRoute: 'admin.locations.index',
  module: 'location',
  templateModelField: 'Location',
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    let model = this.get('simpleStore').find('location', {new_pk: new_pk}).objectAt(0);
    const repository = this.get('repository');
    if(!model){
      model = repository.create(new_pk);
    }
    return Ember.RSVP.hash({
      model: model,
      repository: repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default LocationNewRoute;
