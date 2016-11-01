import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    recipient: {
      associated_model: 'person',
      join_model: 'generic-join-recipients',
      associated_pointer: 'recipient',
      main_model: 'sendemail'
    }
  }
});
