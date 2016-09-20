import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var LocationLevelRoute = TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  repository: inject('location-level'),
  redirectRoute: 'admin.location-levels.index',
  module: 'location-level',
  templateModelField: Ember.computed(function() { return 'name'; }),
  model(params) {
    const pk = params.location_level_id;
    const repository = this.get('repository');
    let location_level = this.get('simpleStore').find('location-level', pk);
    const override = true;
    /* MOBILE SPECIFIC */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.location-level.section.details'), 'component': 'location-levels/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.location-level.section.children'), 'component': 'location-levels/children-section'},
    ];
    return this.findByIdScenario(location_level, pk, {repository:repository, hashComponents:hashComponents}, override);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default LocationLevelRoute;
