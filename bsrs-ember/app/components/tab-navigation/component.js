import Ember from 'ember';

export default Ember.Component.extend({
  tabList: Ember.inject.service(),
  tagName: '',
  /*
   * singleTabIsDirty 
   * singleTab does not have access to all models in this context, so use tabService showModal function to determine if any of its models are dirty
   * Note: unsure why need {or} truth-helper in template for single model.
   * @return {boolean}
   */
  singleTabIsDirty: Ember.computed('model.isDirtyOrRelatedDirty', function() {
    const tabService = this.get('tabList');
    const tab = this.get('tab');
    return tabService.showModal(tab, 'closeTab');
  }),
  actions: {
    close(tab){
      this.attrs.close(tab);
    },
    /*
     * rollback_model
     * Rollback for multiple tabs should always close tab
     * Rollback for single tabs (dtd) should not close tab
     * When closing single tab should send 'closeTab' action
     */
    rollback_model() {
      const tab = this.trx.attemptedTabModel;
      const model = this.trx.attemptedTransitionModel;
      const action = this.trx.attemptedAction; 
      const closeTabAction = this.trx.closeTabAction;
      if(tab.get('tabType') === 'multiple') {
        model.rollback();
      } else {
        this.get('tabList').rollbackAll(tab);
      }
      tab.toggleProperty('modalIsShowing');
      if (tab.get('tabType') === 'multiple' || closeTabAction === 'closeTab') {
        this.attrs.closeTabMaster(tab, {action:'closeTab'});
      }
      this.attrs.closeTabMaster(tab, {action:'rollback'});
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
      this.attrs.closeTabMaster(tab, {action:action, confirmed:true});//call closeTabMaster action again w/ different action to closeTab
    },
  }
});
