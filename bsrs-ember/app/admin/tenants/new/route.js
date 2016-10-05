import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

export default TabNewRoute.extend({
  repository: inject('tenant'),
  uuid: injectUUID('uuid'),
  redirectRoute: 'admin.tenants.index',
  module: 'tenant',
  templateModelField: 'Tenant',
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    let model = this.get('simpleStore').find('automation', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = repository.create(new_pk);
      model.change_implementation_email({id: this.get('uuid').v4()});
      model.change_billing_email({id: this.get('uuid').v4()});
      model.change_billing_phone_number({id: this.get('uuid').v4()});
      model.change_billing_address({id: this.get('uuid').v4()});
    }
    return Ember.RSVP.hash({
      model,
      repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});
