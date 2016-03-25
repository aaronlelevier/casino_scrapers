import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

const detail_msg = 'admin.dtd.empty-detail';

var DTDSRoute = GridViewRoute.extend({
  i18n: Ember.inject.service(),
  module: 'dtd',
  displayText: Ember.computed(function() { return this.get('i18n').t('admin.dtd.one'); }),
  redirectRoute: 'admin',
  transitionCB: function() {},
  tabList: Ember.inject.service(),
  afterModel(){
    this.get('tabList').createSingleTab({
      routeName: this.routeName,
      module: this.get('module'),
      displayText: this.get('displayText'),
      redirectRoute: this.get('redirectRoute'),
      transitionCB: this.transitionCB.bind(this),//any callbacks you want to call or store mods to make
    });
    // original, none tab
    this.get('store').push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true, message: detail_msg});
    return this._super(...arguments);
  },
  repository: inject('dtd'),
});

export default DTDSRoute;
