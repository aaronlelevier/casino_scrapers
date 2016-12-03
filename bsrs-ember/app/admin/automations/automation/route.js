import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.automation.single', { description: this.get('description') });
  },
  description: undefined,
  repository: inject('automation'),
  redirectRoute: 'admin.automations.index',
  module: 'automation',
  templateModelField: 'description',
  model(params, transition) {
    const pk = params.automation_id;
    const model = this.get('simpleStore').find('automation', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.automation.section.details'), 'component': 'automations/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.automation.section.filters'), 'component': 'automations/filter-section', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents, repository:this.get('repository') });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);

    // set doctitle
    this.set('description', hash.model.get('description'));
  }
});
