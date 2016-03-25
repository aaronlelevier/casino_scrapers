import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import GridViewRoute from 'bsrs-ember/mixins/route/components/grid';

const detail_msg = 'admin.dtd.empty-detail';

var DTDSRoute = GridViewRoute.extend({
  modelName: Ember.computed(function() { return 'dtd'; }),
  templateModelField: Ember.computed(function() { return 'singleTab'; }),
  redirectRoute: Ember.computed(function() { return 'admin'; }),
  transitionCallback: function() {},
  tabList: Ember.inject.service(),
  afterModel(){
    // tab
    let id = 'dtd123';
    this.get('tabList').createTab(
        id,
        this.routeName,//doc_route
        this.get('modelName'),//doc_type
        this.get('templateModelField'),//templateModelField
        this.get('redirectRoute'),//redirect
        false,//newModel
        this.transitionCallback.bind(this),//any callbacks you want to call or store mods to make
        undefined,
        undefined,
        'admin.dtd.one'
    );
    // original, none tab
    this.get('store').push('dtd-header', {id: 1, showingList:true, showingDetail:true, showingPreview:true, message: detail_msg});
    return this._super(...arguments);
  },
  repository: inject('dtd'),
});

export default DTDSRoute;
