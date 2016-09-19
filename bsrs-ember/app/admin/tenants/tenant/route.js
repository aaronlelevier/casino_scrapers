import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: injectRepo('tenant'),
  redirectRoute: 'admin.tenants.index',
  module: 'tenant',
  templateModelField: 'company_name',
  model(params, transition) {
    const pk = params.tenant_id;
    const model = this.get('simpleStore').find('tenant', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': 'components/tenant/detail-section', 'component': 'tenant/components/tenant/detail-section', active: 'active'},
      {'title': 'components/tenant/billing-section', 'component': 'tenant/components/tenant/billing-section', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents, repository: this.get('repository') });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
