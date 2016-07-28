import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: injectRepo('<%= dasherizedModuleName %>'),
  redirectRoute: '<%= dasherizedModuleName %>s.index',
  module: '<%= dasherizedModuleName %>',
  templateModelField: 'description',
  model(params, transition) {
    const pk = params.<%= camelizedModuleName %>_id;
    const model = this.get('simpleStore').find('<%= dasherizedModuleName %>', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': '<%= hashComponentOne %>', 'component': '<%= dasherizedModuleName %>/<%= hashComponentOne %>', active: 'active'},
      {'title': '<%= hashComponentTwo %>', 'component': '<%= dasherizedModuleName %>/<%= hashComponentTwo %>', active: ''},
    ];
    return this.findByIdScenario(model, pk, { hashComponents:hashComponents });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
