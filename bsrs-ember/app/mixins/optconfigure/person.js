import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'people',
      property: 'status',
    },
    photo: {
      collection: 'people',
      property: 'attachment',
      related_model: 'photo',
    },
    role: {
      collection: 'people',
      property: 'role',
    },
    locale: {
      collection: 'people',
      property: 'locale',
    },
    locations: {
      associated_model: 'location',
      join_model: 'person-location'
    },
    phone_number_type: {
      collection: 'people',
      property: 'phone-number-type',
      related_model: 'phone_number_type',
    },
    email_type: {
      collection: 'people',
      property: 'email-type'
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


