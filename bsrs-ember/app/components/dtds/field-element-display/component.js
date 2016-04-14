import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['form-group'],
  actions: {
    updateRequest(value, label, ticket, ...opts) {
      if(!value) {
        value = opts[0];//input value resulting from key-up action
      }
      this.attrs.updateRequest(value, label, ticket);
    }
  }
});
