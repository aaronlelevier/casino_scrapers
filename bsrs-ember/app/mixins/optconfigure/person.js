import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'people',
      related_model: 'status',
    },
    role: {
      collection: 'people',
      related_model: 'role',
    },
    locale: {
      collection: 'people',
      related_model: 'locale',
    }
  },
});


