import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    linkClick(destination_id, ticket) {
      this.attrs.linkClick(destination_id, ticket);
    }
  }
});
