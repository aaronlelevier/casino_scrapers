import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    hat: {
      collection: 'users',
      property: 'hat',
    },
    shirt: {
      collection: 'users',
      property: 'shirt',
    },
    user_status: {
      collection: 'users',
      property: 'user-status',
    },
    shoes: {
      associated_model: 'shoe',
      join_model: 'user-shoe'
    },
    feet: {
      associated_model: 'feet',
      join_model: 'user-feet'
    },
    fingers: {
      associated_model: 'finger',
      join_model: 'user-finger'
    },
  },
});
