import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: injectRepo('<%= dasherizedModuleName %>s'),
  redirectRoute: '<%= dasherizedModuleName %>s.index',
  module: '<%= dasherizedModuleName %>',
  templateModelField: 'description',
  model(params, transition) {
    const pk = params.<%= camelizedModuleName %>_id;
    const model = this.get('simpleStore').find('<%= dasherizedModuleName %>', pk);
    /* Mobile - put data needed in hasComponents (ie status, otherXhrs) */
    const hashComponents = [
      {'title': '<%= hashComponentOne %>', 'component': '<%= dasherizedModuleName %>/<%= hashComponentOne %>-section', active: 'active'},
      {'title': '<%= hashComponentTwo %>', 'component': '<%= dasherizedModuleName %>/<%= hashComponentTwo %>-section', active: ''},
    ];
    return this.findByIdScenario(model, pk { hashComponents:hashComponents });
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
