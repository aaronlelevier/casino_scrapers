import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'section',
  attributeBindings: ['dataTestId:data-test-id']
});
