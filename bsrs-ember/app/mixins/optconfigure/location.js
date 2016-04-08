import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'locations',
      related_model: 'location-status',
      main_related_model: 'status'
    },
    location_level: {
      collection: 'locations',
      related_model: 'location-level',
    },
  },
});



