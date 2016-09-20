import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationLevelNew = TabRoute.extend({
  repository: injectRepo('location-level'),
  redirectRoute: 'admin.location-levels.index',
  module: 'location-level',
  templateModelField: Ember.computed(function() { return 'location-level'; }),
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    let model = this.get('simpleStore').find('location-level', {new_pk: new_pk}).objectAt(0);
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

export default LocationLevelNew;
