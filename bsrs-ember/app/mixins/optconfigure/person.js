import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'people',
      owner: 'status',
    },
    photo: {
      collection: 'people',
      owner: 'attachment',
      override_property_getter: 'photo',
    },
    role: {
      collection: 'people',
      owner: 'role',
    },
    locale: {
      collection: 'people',
      owner: 'locale',
    },
    locations: {
      associated_model: 'location',
      join_model: 'person-location'
    },
    phone_number_type: {
      collection: 'people',
      owner: 'phone-number-type',
      override_property_getter: 'phone_number_type',
    },
    email_type: {
      collection: 'people',
      owner: 'email-type'
    },
    phonenumbers: {
      associated_model: 'phonenumber',
      join_model: 'person-join-phonenumber'
    },
    emails: {
      associated_model: 'email',
      join_model: 'person-join-email'
    },
  },
});


