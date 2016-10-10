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
    let model = this.get('simpleStore').find('tenant', {new_pk: new_pk}).objectAt(0);
    if(!model){

      const id1 = this.get('uuid').v4();
      const id2 = this.get('uuid').v4();
      const id3 = this.get('uuid').v4();
      const id4 = this.get('uuid').v4();

      model = repository.create(new_pk, {
        billing_address_fk: id1,
        billing_email_fk: id2,
        billing_phone_number_fk: id3,
        implementation_email_fk: id4,
      });

      model.change_billing_address({id: id1});
      model.change_billing_email({id: id2});
      model.change_billing_phone_number({id: id3});
      model.change_implementation_email({id: id4});

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
