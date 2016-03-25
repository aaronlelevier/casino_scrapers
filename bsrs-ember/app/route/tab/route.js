import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var TabRoute = Ember.Route.extend({
  transitionCB: function() {},
  tabList: Ember.inject.service(),
  afterModel(model, transition) {
    let id = model.model ? model.model.get('id') : model.get('id');
    this.get('tabList').createTab({
      id: id,
      routeName: this.routeName,
      module: this.get('module'),
      templateModelField: this.get('templateModelField'),
      redirectRoute: this.get('redirectRoute'),
      newModel: false,
      transitionCB: this.transitionCB.bind(this)
    });
  }
});

export default TabRoute;
