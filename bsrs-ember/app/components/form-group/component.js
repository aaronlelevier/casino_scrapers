import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'div',
  classNames: ['form-group'],
  attributeBindings: ['dataTestId:data-test-id']
});
