import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabNewRoute = Ember.Route.extend({
  tabList: Ember.inject.service(),
  afterModel(model, transition) {
    this.get('tabList').createTab({
      id: model.model.get('id'), 
      routeName: this.routeName, 
      module: this.get('module'), 
      templateModelField: this.get('templateModelField'), 
      redirectRoute: this.get('redirectRoute'), 
      newModel: true
    });
  },
  actions: {
    parentAction(tab){
      let model = this.get('store').find(tab.get('module'), tab.get('id'));
      if (model && model.get('isDirtyOrRelatedDirty')) {
        // Ember.$('.t-modal').modal('show');
        this.trx.attemptedTabModel = tab;
        this.trx.attemptedTransitionModel = model;
        this.trx.attemptedAction = 'parentAction';
      } else {
        Ember.$('.t-modal').modal('hide');
        let temp = this.router.generate(this.routeName);
        temp = temp.split('/').pop();
        if(temp === tab.get('id') || tab.get('newModel')){
          this.transitionTo(tab.get('redirectRoute'));
          if (tab.get('newModel') && !tab.get('saveModel')) {
            model.removeRecord();
          }
        }else if(this.routeName !== tab.get('redirectRoute')){
          this.transitionTo(this.routeName);
        }else if(typeof tab.get('redirectRoute') !== undefined){
          this.transitionTo(tab.get('redirectRoute'));
        }
        this.get('tabList').closeTab(model.get('id'));
      }
    },
    parentActionDelete(tab, model, repository) {
      this.send('parentAction', tab);
      repository.delete(model.get('id'));
    }
  }
});

export default TabNewRoute;
