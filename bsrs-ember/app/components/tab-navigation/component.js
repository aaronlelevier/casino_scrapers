import Ember from 'ember';

export default Ember.Component.extend({
  tabList: Ember.inject.service(),
  tagName: '',
  actions: {
    close(tab){
      this.attrs.close(tab);
    },
    rollback_model() {
      const tab = this.trx.attemptedTabModel;
      const model = this.trx.attemptedTransitionModel;
      const action = this.trx.attemptedAction; 
      const closeTabAction = this.trx.closeTabAction;
      model.rollback();
      tab.toggleProperty('modalIsShowing');
      this.attrs.closeTabMaster(tab);
    },
    cancel_modal() {
      const tab = this.trx.attemptedTabModel;
      tab.toggleProperty('modalIsShowing');
    },
    delete_model() {
      const tab = this.trx.attemptedTabModel;
      const action = this.trx.closeTabAction;
      const deleteCB = this.trx.deleteCB; 
      tab.toggleProperty('modalIsShowing');
      if (action === 'deleteAttachment') {
        return deleteCB();//don't want to transition if only deleting an attachment
      }
      deleteCB();
      this.attrs.closeTabMaster(tab, action);//call closeTabMaster action again w/ different action to closeTab
    },
  }
});
