import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

export default TabNewRoute.extend({
  repository: inject('tenant'),
  redirectRoute: 'admin.tenants.index',
  module: 'tenant',
  templateModelField: 'Tenant',
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    const model = repository.create(new_pk);
    return Ember.RSVP.hash({
      model,
      repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});
