import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var RoleRoute = TabRoute.extend(FindById, {
  repository: inject('role'),
  redirectRoute: 'admin.roles.index',
  module: 'role',
  templateModelField: 'name',
  i18n: Ember.inject.service(),
  model(params) {
    const pk = params.role_id;
    const repository = this.get('repository');
    let role = repository.fetch(pk);
    /* otherXhrs - array of additional promises to be returned from model hook. Must pass override to work */
    const otherXhrs = [repository.getRouteData()];
    const override = true;
    const hashComponents = [
      {'title': this.get('i18n').t('admin.role.section.details'), 'component': 'roles/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.role.section.settings'), 'component': 'roles/settings-section', active: ''},
    ];
    return this.findByIdScenario(role, pk, { hashComponents:hashComponents, repository:repository }, 
                                 override, otherXhrs);
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default RoleRoute;
