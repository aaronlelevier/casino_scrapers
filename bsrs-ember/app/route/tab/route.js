import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';

var TabRoute = Ember.Route.extend({
    tabList: Ember.inject.service(),
    store: injectStore('main'),
    afterModel(model, transition) {
        //create tab
        let id = model.model ? model.model.get('id') : model.get('id');
        this.get('tabList').createTab(this.routeName, this.get('modelName'), id, this.get('templateModelField'), this.get('redirectRoute'));
    },
    actions: {
        //this is called from base controller 
        // parentAction(tab){
        //     let model = this.get('store').find(tab.get('doc_type'), tab.get('id'));
        //     if (model && model.get('isDirtyOrRelatedDirty')) {
        //         Ember.$('.t-modal').modal('show');
        //         this.trx.attemptedTabModel = tab;
        //         this.trx.attemptedTransitionModel = model;
        //         this.trx.attemptedAction = 'parentAction';
        //     } else {
        //         Ember.$('.t-modal').modal('hide');
        //         let temp = this.router.generate(this.routeName);
        //         temp = temp.split('/').pop();
        //         if(temp === tab.get('id') || tab.get('newModel')){
        //             this.transitionTo(tab.get('redirect'));
        //             if (tab.get('newModel') && !tab.get('saveModel')) {
        //                 model.removeRecord(); 
        //             }
        //         }else if(this.routeName !== tab.get('redirect')){
        //             this.transitionTo(this.routeName);
        //         }else if(typeof tab.get('redirect') !== undefined){
        //             this.transitionTo(tab.get('redirect'));
        //         }
        //         this.get('tabList').closeTab(model.get('id'));
        //     }
        // },
        // parentActionDelete(tab, model, repository) {
        //     this.send('closeTabMaster', tab);
        //     repository.delete(model.get('id'));
        // }
    }
});

export default TabRoute;
