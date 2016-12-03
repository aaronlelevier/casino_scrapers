import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.tenant.single', { companyName: this.get('tabCompany') });
  },
  tabCompany: undefined,
  repository: injectRepo('tenant'),
  redirectRoute: 'admin.tenants.index',
  module: 'tenant',
  templateModelField: 'company_name',
  model(params, transition) {
    const pk = params.tenant_id;
    const model = this.get('simpleStore').find('tenant', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': 'components/tenant/detail-section', 'component': 'tenants/tenant/detail-section', active: 'active'},
      {'title': 'components/tenant/implementation-section', 'component': 'tenants/tenant/implementation-section', active: ''},
      {'title': 'components/tenant/billing-section', 'component': 'tenants/tenant/billing-section', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents, repository: this.get('repository') });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);

    // set doctitle
    this.set('tabCompany', hash.model.get('company_name'));
  }
});
