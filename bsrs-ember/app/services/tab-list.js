import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  store: inject('main'),
  previousLocation: undefined,
  findTabByType(id, type='multiple') {
    if (type === 'single') {
      return this.get('store').find('tab-single', id);
    }
    return this.get('store').find('tab', id);
  },
  /* Default to redirectRoute defined on module route if all redirect route locations are the same
   * previousLocation is logged with each tab and will redirect to that location if user visits tab directly from a different module
   * @param {string} tab 
   * @param {string} current_route 
   * @param {string} action 
   */
  redirectRoute(tab, currentRoute, action) {
    // const prev = this.get('previousLocation') || currentRoute;
    // if (prev && !prev.split('.')[0].includes(tab.get('module'))) {
    //   return prev;
    // }
    if (action === 'closeTab') {
      return tab.get('closeTabRedirect') || tab.get('redirectRoute');
    } else if (action === 'delete') {
      return tab.get('deleteRedirect') || tab.get('redirectRoute');
    }
    return tab.get('redirectRoute');
  },
  // /* logs route from willDestroyElement of every component
  //  * @param {string} route 
  //  */
  // logLocation(route) {
  //   const store = this.get('store');
  //   const tabs = store.find('tab');
  //   const tab_singles = store.find('tab-single');
  //   tabs.forEach((tab) => {
  //     run(() => {
  //       store.push('tab', {id: tab.get('id'), previousLocation: route});
  //     });
  //   });
  //   tab_singles.forEach((tab) => {
  //     run(() => {
  //       store.push('tab-single', {id: tab.get('id'), previousLocation: route});
  //     });
  //   });
  // },
  /* Determines if model or models (if trying to close single tab) is dirty based on type 
   * @param {string} route 
   * @param {string} action 
   * @return {boolean}
   */
  isDirty(tab, action) {
    if (tab.get('tabType') === 'single' && action === 'closeTab') {
      return tab.get('modelList').isAny('isDirtyOrRelatedDirty');
    }
    return tab.get('model').get('isDirtyOrRelatedDirty');
  },
  callCB(tab) {
    const cb = tab.get('transitionCB');
    if(cb) {
      cb();    
    } 
  },
  //
  //
  //
  findTab(id) {
    return this.get('store').find('tab', id);
  },
  createTab(args){
    let { id, module, routeName, redirectRoute, templateModelField, newModel, transitionCB } = args;
    this.get('store').push('tab', {
      id: id,
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
    this.get('store').push('tab', {
      id: `${module}123`,
      module: module,
      routeName: routeName,
      displayText: displayText,
      redirectRoute: redirectRoute,
      closeTabRedirect: closeTabRedirect,
      transitionCB: transitionCB,
      model_id: model_id, 
      newModel: newModel || false,
    });
  },
  closeTab(id){
    this.get('store').remove('tab', id);
  }
});
