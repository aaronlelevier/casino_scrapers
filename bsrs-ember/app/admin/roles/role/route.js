import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var RoleRoute = TabRoute.extend(FindById, {
  repository: inject('role'),
  redirectRoute: 'admin.roles.index',
  module: 'role',
  templateModelField: 'name',
  model(params, transition) {
    const store = this.get('simpleStore');
    const pk = params.role_id;
    const repository = this.get('repository');
    const all_role_types = store.find('role-type');
    const all_location_levels = store.find('location-level');
    let role = repository.fetch(pk);
    /* otherXhrs - array of additional promises to be returned from model hook. Must pass override to work */
    const otherXhrs = [repository.getRouteData()];
    const override = true;
    return this.findByIdScenario(role, pk, {repository:repository, all_role_types:all_role_types, all_location_levels:all_location_levels}, override, otherXhrs);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default RoleRoute;
