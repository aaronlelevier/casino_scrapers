import Ember from 'ember';

export default Ember.Component.extend({
  attributeBindings: ['dasherizedField:data-test-id'],
  dasherizedField: Ember.computed(function() {
    return this.get('field').replace('_', '-');
  })
});
