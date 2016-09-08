import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    email_type: {
      collection: 'emails',
      property: 'email-type',
    }
  }
});
