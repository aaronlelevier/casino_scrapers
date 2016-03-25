import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  store: inject('main'),
  findTab(id) {
    return this.get('store').find('tab', id);
  },
  createTab(id, doc_route, doc_type, templateModelField, redirect=undefined, newModel=false, transitionCallback=undefined, model_id=undefined, closeTabRedirect=undefined, tabTitle=undefined){
    this.get('store').push('tab', {
      id: id,
      doc_type: doc_type,
      doc_route: doc_route,
      templateModelField: templateModelField,
      redirect: redirect,
      newModel: newModel,
      transitionCallback: transitionCallback,
      model_id: model_id, //used for singleTabs,
      closeTabRedirect: closeTabRedirect, //used for new dtd tab that has two different actions depending on cancel or close
      tabTitle: tabTitle
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
