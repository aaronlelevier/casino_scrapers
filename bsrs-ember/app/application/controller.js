import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    cancel_modal() {
      Ember.$('.t-modal').modal('hide');
    },
  }
});
