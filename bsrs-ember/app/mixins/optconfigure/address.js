import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    country: {
      collection: 'addresses',
      owner: 'country',
    },
    state: {
      collection: 'addresses',
      owner: 'state',
    },
    address_type: {
      collection: 'addresses',
      owner: 'address-type',
    }
  }
});
