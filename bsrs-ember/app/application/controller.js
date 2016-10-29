import Ember from 'ember';
const { Controller } = Ember;

export default Controller.extend({
  showModal: false,
  action: '',
  module: '',
  modalIsShowing: Ember.computed('showModal', function() {
    return this.get('showModal');
  }),

  /*
    Notification properties to display app wide error or notices.

    @method handleNotfication
    @param {Error|Object} notice `{message,level}`
  */
  handleNotfication(notice) {
    if (this.get('isDestroying') || this.get('isDestroyed')) {
      return;
    }
    this.setProperties({ message: notice.message, level: notice.level });
  },

  actions: {
    /*
     * rollback_model
     * Rollback for multiple tabs should always close tab - all modules except dtd.
     * Rollback for single tabs (dtd) should not close tab - tabs that only can have one open at a time
     */
    rollback_model() {
      const tab = this.trx.attemptedTabModel;
      const model = this.trx.attemptedTransitionModel;
      const action = this.trx.attemptedAction; 
      const closeTabAction = this.trx.closeTabAction;
      const tabService = this.trx.tabService;

      // ROLLBACK
      if(tab.get('tabType') === 'multiple') {
        model.rollback();
      } else {
        tabService.rollbackAll(tab);
      }

      // CLOSE MODAL
      this.toggleProperty('showModal');

      // REDIRECT BACK TO APPLICATION ROUTE
      /* When closing single tab should send 'closeTab' action */
      if (tab.get('tabType') === 'multiple' || closeTabAction === 'closeTab') {
        this.send('closeTabMaster', tab, {action:'closeTab'});
      } else {
        /* Otherwise should not close the tab for single tabTypes, thus send rollback action that will prevent closing tab in closeTab method of tab service */
        this.send('closeTabMaster', tab, {action:'rollback'});
      }
    },
    cancel_modal() {
      this.toggleProperty('showModal');
    },
    delete_model() {
      const tab = this.trx.attemptedTabModel;
      const action = this.trx.closeTabAction;
      const deleteCB = this.trx.deleteCB; 
      this.toggleProperty('showModal');
      if (action === 'deleteAttachment') {
        return deleteCB();//don't want to transition if only deleting an attachment
      }
      deleteCB();
      this.send('closeTabMaster', tab, {action:action, confirmed:true});//call closeTabMaster action again w/ different action to closeTab
    },
    dismiss_errors() {
      this.setProperties({'message': null, 'level': null});
    }
  },

  /*
    Message for display at the application level for notices

    @property message
    @type String|null
    @default null
  */
  message: null,

  /*
    Level of notice to display for application level for messages.

    E.g. `critical`, `error`, `warning`, `info`, `success`

    @property level
    @type String|null
    @default null
  */
  level: null
});
