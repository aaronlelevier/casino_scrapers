import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    status: {
      collection: 'people',
      property: 'status',
    },
  },
});



