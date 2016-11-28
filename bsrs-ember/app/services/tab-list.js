import Ember from 'ember';
const { run } = Ember;
import config from 'bsrs-ember/config/environment';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  /* Default to redirectRoute defined on module route if all redirect route locations are the same
   * previousLocation is logged with each push and will redirect to that location if user visits tab directly from a different module
   * single tab types do not redirect unless tab is closed or single tab is deleted.  Rollback and cancel do not transition
   * @param {string} tab 
   * @param {string} current_route 
   * @param {string} action 
   */
  redirectRoute(tab, action, confirmed, transitionFunc) {
    this.get('previousLocation');
    // if (prev && !prev.split('.')[0].includes(tab.get('module'))) {
    //   return transitionFunc(prev);
    // }
    const redirectRoute = tab.get('redirectRoute');
    const closeTabRedirect = tab.get('closeTabRedirect');
    // const deleteRedirect = tab.get('deleteRedirect');
    const tabType = tab.get('tabType');
    /* Need to fix this */
    if (action === 'closeTab') {
      return closeTabRedirect ? transitionFunc(closeTabRedirect) : transitionFunc(redirectRoute);
    } else if (action === 'save') {
      if (config.TICKET_INDEX_REFRESH === redirectRoute) {
        return closeTabRedirect ? transitionFunc(closeTabRedirect) : transitionFunc(redirectRoute, { queryParams: {ts: Date.now()} });
      } else {
        return closeTabRedirect ? transitionFunc(closeTabRedirect) : transitionFunc(redirectRoute);
      }
    } else if (action === 'delete') {
      return transitionFunc(redirectRoute);
    } else if (tabType === 'single') {
      if (action === 'delete' && confirmed) {
        return transitionFunc(redirectRoute);
      } else if (action === 'rollback' && tab.get('newModel')) {
        return transitionFunc(redirectRoute);
      }
      /* If single and not closing or deleting it, then don't redirect */
      return;
    }
    transitionFunc(redirectRoute);
  },
  /* logs route from willDestroy of every route
   * not used currently but will when go from ticket detail to person detail to ticket detail and close tab, go to person detail
   * @param {string} route 
   */
  logLocation(route) {
    const store = this.get('simpleStore');
    const tabs = store.find('tab');
    tabs.forEach((tab) => {
      run(() => {
        store.push('tab', {id: tab.get('id'), previousLocation: route});
      });
    });
  },
  /* logs route from willDestroy of every route
   * used for new routes to only navigate when on that tab.  Problem is that uuid is different than new_url so need current location
   * @param {string} route 
   */
  logCurrentLocation(route) {
    const store = this.get('simpleStore');
    const tabs = store.find('tab');
    tabs.forEach((tab) => {
      run(() => {
        store.push('tab', {id: tab.get('id'), currentLocation: route});
      });
    });
  },
  /* Determines if model or models (if trying to close single tab) is dirty based on type in application route
   * Also used to show dirty icon in tab-navigation
   * @param {string} route 
   * @param {string} action 
   * @return {boolean}
   */
  showModal(tab, action, confirmed) {
    /* if single tab need to check all models due to split pane only when closeTab and cancel actions are invoked */
    if (tab.get('tabType') === 'single' && (action === 'save' || action === 'closeTab' || action === 'cancel')) {
      const store = this.get('simpleStore');
      /* if new model, only check the one tab single new model */
      if (tab.get('newModel')) {
        const model = store.find(tab.get('module'), tab.get('model_id'));
        return model.get('isDirtyOrRelatedDirty');
      }
      const models = store.find(tab.get('moduleList'));
      return models.isAny('isDirtyOrRelatedDirty');
    }
    /* if deleting something, always return true as model might not be dirty, otherwise return multiple tabType if dirty */
    return (!confirmed && action === 'delete' || action === 'deleteAttachment') ? true : tab.get('model.isDirtyOrRelatedDirty');
  },
  /*
   * rollbackAll
   * when user wants to close a single tab, all dirty dtd's need to be rolled back
   * some dtd-list models, for ex//, won't have a corresponding model property
   */
  rollbackAll(tab) {
    const models = this.get('simpleStore').find(tab.get('moduleList'));
    models.forEach((listModel) => {
      if (listModel.get('model.id')) {
        listModel.get('model').rollback();
      }
    });
  },
  /* @method callCB
   * e.g. batch delete attachments
   */
  callCB(tab, model) {
    const cb = tab.get('transitionCB');
    if (cb) {
      cb(model);
    }
  },
  findTab(id) {
    const store = this.get('simpleStore');
    const tab = store.find('tab', id);
    if (!tab.get('content')) {
      return store.find('tab', {model_id: id}).objectAt(0);
    }
    return tab;
  },
  createTab(args){
    let { id, module, routeName, redirectRoute, templateModelField, newModel, transitionCB } = args;
    this.get('simpleStore').push('tab', {
      id: id,
      tabType: 'multiple',
      module: module,
      routeName: routeName,
      templateModelField: templateModelField,
      redirectRoute: redirectRoute,
      newModel: newModel,
      transitionCB: transitionCB,
    });
  },
  createSingleTab(args){
    let { module, routeName, displayText, redirectRoute, closeTabRedirect, transitionCB, model_id, newModel } = args;
    this.get('simpleStore').push('tab', {
      id: module,
      tabType: 'single',
      model_id: model_id, 
      module: module,
      moduleList: `${module}-list`,
      routeName: routeName,
      displayText: displayText,
      redirectRoute: redirectRoute,
      closeTabRedirect: closeTabRedirect,
      transitionCB: transitionCB,
      newModel: newModel || false,
    });
  },
  /*
   * if single tab and action is either cancel or rollback, dont close the tab
   */
  closeTab(tab, action){
    if (action === 'closeTab' || tab.get('tabType') === 'multiple') {
      this.get('simpleStore').remove('tab', tab.get('id'));
    }
  }
});
