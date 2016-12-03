import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var RoleNewRoute = TabNewRoute.extend({
  title() {
    return this.get('i18n').t('doctitle.role.new');
  },
  repository: inject('role'),
  redirectRoute: 'admin.roles.index',
  module: 'role',
  templateModelField: Ember.computed(function() { return 'Role'; }),
  i18n: Ember.inject.service(),
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    let model = this.get('simpleStore').find('role', {new_pk: new_pk}).objectAt(0);
    if(!model){
      const all_role_types = this.get('simpleStore').find('role-type');
      const default_role_type = all_role_types.objectAt(0).get('name');
      model = repository.create(default_role_type, new_pk);
    }
    const otherXhrs = [repository.getRouteData()];
    const hashComponents = [
      {'title': this.get('i18n').t('admin.role.section.details'), 'component': 'roles/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.role.section.settings'), 'component': 'roles/settings-section', active: ''},
    ];
    return Ember.RSVP.hash({
      model,
      otherXhrs: Ember.RSVP.all(otherXhrs),
      repository,
      hashComponents
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default RoleNewRoute;
