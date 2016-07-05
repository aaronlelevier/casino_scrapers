import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

export default TabRoute.extend(FindById, {
  simpleStore: Ember.inject.service(),
  repository: injectRepo('profile'),
  redirectRoute: 'admin.profiles.profile',
  module: 'profile',
  templateModelField: 'description',
  model(params, transition) {
    const pk = params.profile_id;
    const model = this.get('simpleStore').find('profile', pk);
    return this.findByIdScenario(model, pk);
  },
  setupController(controller, hash) {
    controller.setProperties(hash);
  }
});
