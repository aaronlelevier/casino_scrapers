import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  repository: inject('tenant'),
  redirectRoute: 'admin',
  module: 'tenant',
  templateModelField: 'translated_title',
  currencyObjects: Ember.computed(function() {
    return this.get('simpleStore').find('currency');
  }),
  model(params) {
    const model = this.get('simpleStore').findOne('tenant');
    const deps = {
      currencyObjects: this.get('currencyObjects')
    };
    return this.findByIdScenario(model, params.id, deps);
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
