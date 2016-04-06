import Ember from 'ember';

var ApplicationDeleteModalComponent = Ember.Component.extend({
  classNames: ['application-modal'],
  actions: {
    delete_model() {
      const tab = this.trx.attemptedTabModel;
      const action = this.trx.attemptedAction; //closeTabMaster or parentAction (for new tab)
      const deleteCB = this.trx.deleteCB; 
      deleteCB();
      this.sendAction(action, tab);
    },
    cancel_modal() {
      //action lives on controller
      this.attrs.cancel_modal();
    }
  }
});

export default ApplicationDeleteModalComponent;
