import Ember from 'ember';

export default Ember.Component.extend({
  dasherizedField: Ember.computed(function() {
    return this.get('field').replace('_', '-');
  })
});
