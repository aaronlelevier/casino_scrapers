import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    location_level: {
      collection: 'roles',
      related_model: 'location-level',
    }
  },
});



