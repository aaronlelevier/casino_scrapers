import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabRoute = Ember.Route.extend({
    tabList: Ember.inject.service(),
    afterModel(model, transition) {
        //create tab
        let id = model.model ? model.model.get('id') : model.get('id');
        this.get('tabList').createTab(this.routeName,
            this.get('modelName'),
            id,
            this.get('templateModelField'),
            this.get('redirectRoute'));
    }
});

export default TabRoute;