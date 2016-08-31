import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    country: {
      collection: 'addresses',
      property: 'country',
      related_model: 'country',
    },
    state: {
      collection: 'addresses',
      property: 'state',
      related_model: 'state',
    },
    address_type: {
      collection: 'addresses',
      property: 'address-type',
      related_model: 'address_type',
    }
  }
});
