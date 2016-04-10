import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    location_level: {
      collection: 'roles',
      property: 'location-level',
    },
    category: {
      associated_model: 'category',
      join_model: 'role-category'
    }
  },
});



