import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var RoleNewRoute = TabNewRoute.extend({
  repository: inject('role'),
  redirectRoute: 'admin.roles.index',
  module: 'role',
  templateModelField: Ember.computed(function() { return 'Role'; }),
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    const all_role_types = this.get('simpleStore').find('role-type');
    const all_location_levels = this.get('simpleStore').find('location-level');
    let model = this.get('simpleStore').find('role', {new_pk: new_pk}).objectAt(0);
    if(!model){
      const all_role_types = this.get('simpleStore').find('role-type');
      const default_role_type = all_role_types.objectAt(0).get('name');
      model = this.get('repository').create(default_role_type, new_pk);
    }
    const otherXhrs = [repository.getRouteData()];
    return Ember.RSVP.hash({
      model,
      all_role_types,
      all_location_levels,
      otherXhrs: Ember.RSVP.all(otherXhrs)
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default RoleNewRoute;
