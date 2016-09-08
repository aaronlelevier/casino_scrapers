import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    phone_number_type: {
      collection: 'phonenumbers',
      property: 'phone-number-type',
      related_model: 'phone_number_type'
    }
  }
});