import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'people',
      property: 'status',
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
    }
  },
});

