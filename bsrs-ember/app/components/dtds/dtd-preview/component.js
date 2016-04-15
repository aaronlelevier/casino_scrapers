import Ember from 'ember';

export default Ember.Component.extend({
  fieldsCompleted: Ember.computed('ticket.requestValues.[]', function() {
    const fields = this.get('model.fields');
    const ticket = this.get('ticket');
    //length of array should be the same as the values stored in the ongoing ticket...
    return fields.get('length') === ticket.get('requestValues').length ? '' : 'disabled';
  }),
  actions: {
    linkClick(destination_id, ticket) {
      this.attrs.linkClick(destination_id, ticket);
    }
  }
});
