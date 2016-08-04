import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: inject('assignment'),
  redirectRoute: 'admin.assignments.index',
  module: 'assignment',
  templateModelField: 'description',
  model(params, transition) {
    const pk = params.assignment_id;
    const model = this.get('simpleStore').find('assignment', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': 'Detail Section', 'component': 'assignments/detail-section', active: 'active'},
      {'title': 'Filter Section', 'component': 'assignments/filter-section', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents, repository:this.get('repository') });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
