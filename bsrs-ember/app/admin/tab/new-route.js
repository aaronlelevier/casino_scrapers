import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabNewRoute = Ember.Route.extend({
    tabList: Ember.inject.service(),
    afterModel(model, transition) {
        this.get('tabList').createTab(this.routeName, this.get('modelName'), model.model.get('id'), this.get('templateModelField'), this.get('redirectRoute'), true);
    }
});

export default TabNewRoute;

