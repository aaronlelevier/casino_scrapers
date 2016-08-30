import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: inject('assignment'),
  redirectRoute: 'admin.assignments.index',
  module: 'assignment',
  templateModelField: 'description',
  i18n: Ember.inject.service(),
  model(params, transition) {
    const pk = params.assignment_id;
    const model = this.get('simpleStore').find('assignment', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': this.get('i18n').t('admin.assignment.section.details'), 'component': 'assignments/detail-section', active: 'active'},
      {'title': this.get('i18n').t('admin.assignment.section.filters'), 'component': 'assignments/filter-section', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents, repository:this.get('repository') });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
