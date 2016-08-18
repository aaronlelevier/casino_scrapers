import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var LocationLevelRoute = TabRoute.extend(FindById, {
  repository: inject('location-level'),
  redirectRoute: 'admin.location-levels.index',
  module: 'location-level',
  templateModelField: Ember.computed(function() { return 'name'; }),
  model(params) {
    const pk = params.location_level_id;
    const repository = this.get('repository');
    let location_level = this.get('simpleStore').find('location-level', pk);
    const override = true;
    return this.findByIdScenario(location_level, pk, {repository:repository}, override);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default LocationLevelRoute;
