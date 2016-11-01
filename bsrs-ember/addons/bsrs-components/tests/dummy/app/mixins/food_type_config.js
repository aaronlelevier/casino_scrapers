import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    finger_food: {
      associated_model: 'finger-food',
      join_model: 'finger-join-food'
    },
  },
});
