import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['input-group'],
  attributeBindings: ['dataTestId:data-test-id'],
});
