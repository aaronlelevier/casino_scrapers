import Ember from 'ember';

var ApplicationModalComponent = Ember.Component.extend({
  classNames: ['application-modal'],
  actions: {
    rollback_model() {
      let tab = this.trx.attemptedTabModel;
      let model = this.trx.attemptedTransitionModel;
      let action = this.trx.attemptedAction; //closeTabMaster or parentAction (for new tab)
      const closeTabAction = this.trx.closeTabAction; //pass back in so exists when hit rollback
      model.rollback();
      this.sendAction(action, tab, closeTabAction);
    },
    cancel_modal() {
      //action lives on controller
      this.attrs.cancel_modal();
    }
  }
});

export default ApplicationModalComponent;
