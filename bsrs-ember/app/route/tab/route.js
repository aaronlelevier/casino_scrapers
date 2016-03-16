import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabRoute = Ember.Route.extend({
    transitionCallback: function() {},
    tabList: Ember.inject.service(),
    afterModel(model, transition) {
        let id = model.model ? model.model.get('id') : model.get('id');
        this.get('tabList').createTab(id,
            this.routeName,//doc_route
            this.get('modelName'),//doc_type
            this.get('templateModelField'),//templateModelField
            this.get('redirectRoute'),//redirect
            false,//newModel
            this.transitionCallback.bind(this)//any callbacks you want to call or store mods to make
        );
    }
});

export default TabRoute;
