import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

export default TabNewRoute.extend({
  repository: inject('tenant'),
  uuid: injectUUID('uuid'),
  redirectRoute: 'admin.tenants.index',
  module: 'tenant',
  templateModelField: 'Tenant',
  emailTypeRepo: injectRepo('email-type'),
  phoneTypeRepo: injectRepo('phone-number-type'),
  addressTypeRepo: injectRepo('address-type'),
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

      // contact types
      let emailType = this.get('emailTypeRepo').get_default();
      let phoneType = this.get('phoneTypeRepo').get_default();
      let addressType = this.get('addressTypeRepo').get_default();

      model.change_billing_address({id: id1, address_type_fk: addressType.get('id')});
      model.change_billing_email({id: id2, email_type_fk: emailType.get('id')});
      model.change_billing_phone_number({id: id3, phone_number_type_fk: phoneType.get('id')});
      model.change_implementation_email({id: id4, email_type_fk: emailType.get('id')});

      model.get('implementation_email').change_email_type({id: emailType.get('id')});
      model.get('billing_email').change_email_type({id: emailType.get('id')});
      model.get('billing_phone_number').change_phone_number_type({id: phoneType.get('id')});
      model.get('billing_address').change_address_type({id: addressType.get('id')});
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
