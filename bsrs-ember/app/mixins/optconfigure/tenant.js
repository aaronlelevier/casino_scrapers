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
      owner: 'currency',
      override_property_getter: 'default_currency',
    },
    billing_phone_number: {
      collection: 'tenants',
      owner: 'phonenumber',
      override_property_getter: 'billing_phone_number',
    },
    billing_email: {
      collection: 'tenants',
      owner: 'email',
      override_property_getter: 'billing_email',
    },
    billing_address: {
      collection: 'tenants',
      owner: 'address',
      override_property_getter: 'billing_address',
    },
    state: {
      collection: 'addresses',
      owner: 'state'
    },
    country: {
      collection: 'addresses',
      owner: 'country'
    },
    implementation_email: {
      //unique reverse lookup key to the tenant
      collection: 'tenants_implementation',
      owner: 'email',
      override_property_getter: 'implementation_email',
    },
    implementation_contact: {
      //unique reverse lookup key to the tenant
      collection: 'tenants_implementation_contact',
      owner: 'person',
      override_property_getter: 'implementation_contact',
    },
    dtd_start: {
      collection: 'tenants_dtd_start',
      owner: 'dtd',
      override_property_getter: 'dtd_start'
    },
    phone_number_type: {
      collection: 'phonenumbers',
      owner: 'phone-number-type',
      override_property_getter: 'phone_number_type',
    },
    email_type: {
      collection: 'emails',
      owner: 'email-type',
      override_property_getter: 'email_type',
    },
    address_type: {
      collection: 'addresses',
      owner: 'address-type',
      override_property_getter: 'address_type',
    },
    countries: {
      associated_model: 'country',
      join_model: 'tenant-join-country',
    },
  }
});
