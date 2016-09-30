import Ember from 'ember';

/**
 * Configuration for bsrs-components add on
 *   - define init function to setup below functions init() { belongs_to.bind(this)('status', 'ticket')}
 *   - * assuming 'status' is passed as first argument
 *   - status (belongs to association to access tickets status)
 *   - change_status
 *   - rollbackStatus
 *   - saveStatus
 *   - statusIsDirty
 *   - statusIsNotDirty
 * Then this file will configure the:
 *   - collection for which the property will find the association
 *   - property that is used as the store model and property on the belongs_to model (ticket)
 *   - related model that overrides the property when doing a this.get('status') method
 */
export default Ember.Mixin.create({
  OPT_CONF: {
    currency: {
      collection: 'tenants',
      property: 'currency',
    },
    billing_phone: {
      collection: 'tenants',
      property: 'phonenumber',
      related_model: 'billing_phone',
    },
    billing_email: {
      collection: 'tenants',
      property: 'email',
      related_model: 'billing_email',
    },
    billing_address: {
      collection: 'tenants',
      property: 'address',
      related_model: 'billing_address',
    },
    state: {
      collection: 'addresses',
      property: 'state'
    },
    country: {
      collection: 'addresses',
      property: 'country'
    },
    implementation_email: {
      collection: 'tenants_implementation',
      property: 'email',
      related_model: 'implementation_email',
    },
    phone_number_type: {
      collection: 'phonenumbers',
      property: 'phone-number-type',
      related_model: 'phone_number_type',
    },
    email_type: {
      collection: 'emails',
      property: 'email-type',
      related_model: 'email_type',
    },
    address_type: {
      collection: 'addresses',
      property: 'address-type',
      related_model: 'address_type',
    },
    countries: {
      associated_model: 'country',
      join_model: 'tenant-join-country',
    },
  }
});