import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'label',
  classNameBindings: ['labelClass'],
  attributeBindings: ['dataTestId:data-test-id']
});
