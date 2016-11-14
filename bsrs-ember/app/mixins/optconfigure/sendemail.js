import Ember from 'ember';

/**
 * @mixin sendemail optconfigure
 * associated_pointer: sendemail's property to as for many models 
 * main_model:  TODO: see if main_model is needed
 */
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
