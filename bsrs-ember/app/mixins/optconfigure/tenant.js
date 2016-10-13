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
    default_currency: {
      collection: 'tenants',
      property: 'currency',
      related_model: 'default_currency',
    },
    billing_phone_number: {
      collection: 'tenants',
      property: 'phonenumber',
      related_model: 'billing_phone_number',
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
      //unique reverse lookup key to the tenant
      collection: 'tenants_implementation',
      property: 'email',
      related_model: 'implementation_email',
    },
    implementation_contact: {
      //unique reverse lookup key to the tenant
      collection: 'tenants_implementation_contact',
      property: 'person',
      related_model: 'implementation_contact',
    },
    dtd_start: {
      collection: 'tenants_dtd_start',
      property: 'dtd',
      related_model: 'dtd_start'
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
