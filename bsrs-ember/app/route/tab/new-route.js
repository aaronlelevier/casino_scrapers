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
    didTransition() {
      this.get('tabList').logCurrentLocation(this.routeName);
    },
    willTransition() {
      this.get('tabList').logLocation(this.router.currentPath);
    },
  }
});

export default TabNewRoute;
