import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    recipient: {
      associated_model: 'person',
      join_model: 'sendsms-join-recipients',
      associated_pointer: 'recipient'
    }
  }
});
