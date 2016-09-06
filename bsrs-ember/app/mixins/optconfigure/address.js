import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    country: {
      collection: 'addresses',
      property: 'country',
    },
    state: {
      collection: 'addresses',
      property: 'state',
    },
    address_type: {
      collection: 'addresses',
      property: 'address-type',
    }
  }
});
