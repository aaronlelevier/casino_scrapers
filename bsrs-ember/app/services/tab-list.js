import Ember from 'ember';
import inject from 'bsrs-ember/utilities/store';

export default Ember.Service.extend({
  store: inject('main'),
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
