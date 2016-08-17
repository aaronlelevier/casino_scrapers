import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var ThirdPartyRoute = TabRoute.extend(FindById, {
  repository: inject('third-party'),
  status_repo: inject('status'),
  redirectRoute: 'admin.third-parties.index',
  module: 'third-party',
  templateModelField: 'name',
  model(params) {
    const pk = params.third_party_id;
    const statuses = this.get('status_repo').find();
    let third_party = this.get('repository').fetch(pk);
    const repository = this.get('repository');
    // const override = true;
    return this.findByIdScenario(third_party, pk, {statuses:statuses, repository:repository});
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default ThirdPartyRoute;
