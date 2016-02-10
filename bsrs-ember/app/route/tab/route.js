import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabRoute = Ember.Route.extend({
    transitionCallback: function() {},
    tabList: Ember.inject.service(),
    afterModel(model, transition) {
        let id = model.model ? model.model.get('id') : model.get('id');
        this.get('tabList').createTab(id,
            this.routeName,
            this.get('modelName'),
            this.get('templateModelField'),
            this.get('redirectRoute'),
            false,
            this.transitionCallback.bind(this)
        );
    }
});

export default TabRoute;
