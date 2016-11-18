import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    phone_number_type: {
      collection: 'phonenumbers',
      owner: 'phone-number-type',
      override_property_getter: 'phone_number_type'
    }
  }
});
