import Ember from 'ember';

var ApplicationModalComponent = Ember.Component.extend({
  classNames: ['application-modal'],
  actions: {
    rollback_model() {
      let tab = this.trx.attemptedTabModel;
      let model = this.trx.attemptedTransitionModel;
      let action = this.trx.attemptedAction; //closeTabMaster or parentAction (for new tab)
      model.rollback();
      this.sendAction(action, tab);
    },
    cancel_modal() {
      //action lives on controller
      this.attrs.cancel_modal();
    }
  }
});

export default ApplicationModalComponent;
