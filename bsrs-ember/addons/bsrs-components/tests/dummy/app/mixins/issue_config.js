import Ember from 'ember';

export default Ember.Mixin.create({
  OPT_CONF: {
    tag: {
      collection: 'issues',
      owner: 'tag',
    }
  },
});
