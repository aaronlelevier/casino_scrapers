import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  simpleStore: Ember.inject.service(),
  repository: inject('tenant'),
  redirectRoute: 'admin',
  module: 'tenant',
  templateModelField: 'translated_title',
  model(params) {
    const model = this.get('simpleStore').findOne('tenant');
    return this.findByIdScenario(model, params.id);
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});