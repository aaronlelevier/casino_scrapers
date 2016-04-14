import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['form-group'],
  actions: {
    optionSelect(value, label, ticket) {
      this.attrs.optionSelect(value, label, ticket);
    }
  }
});
