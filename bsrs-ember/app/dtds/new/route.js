import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

const detail_msg = 'admin.dtd.empty-detail';

var DtdNewRoute = Ember.Route.extend({
  tabList: Ember.inject.service(),
  repository: inject('dtd'),
  redirectRoute: Ember.computed(function() { return 'dtds'; }),
  closeTabRedirect: Ember.computed(function() { return 'admin'; }),
  modelName: Ember.computed(function() { return 'dtd'; }),
  templateModelField: Ember.computed(function() { return 'Definition'; }),
  transitionCallback() { 
  },
  model(params) {
    const store = this.get('store');
    run(() => {
      store.push('dtd-header', {id: 1, message: ''});
    });
    const new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    // let model = this.get('store').find('dtd', {new_pk: new_pk}).objectAt(0);
    // if(!model){
      let model = this.get('repository').create(new_pk);
    // }
    return {
      model: model,
    };
  },
  afterModel(model, transition) {
    const store = this.get('store');
    const model_id = model.model ? model.model.get('id') : model.get('id');
    const id = 'dtd123';
    store.push('dtd', {id: model_id, singleTabId: id});
    this.get('tabList').createTab(id,
      this.routeName,
      this.get('modelName'),
      this.get('templateModelField'),
      this.get('redirectRoute'),
      true,//newModel
      this.transitionCallback.bind(this),
      model_id,
      this.get('closeTabRedirect'),
      'Decision Tree'
     );
  },
  renderTemplate(){
    this.render('dtds.new', {
      into: 'dtds',
      outlet: 'detail'
    });
    this.render('components.dtds.dtd-preview', {
      into: 'dtds',
      outlet: 'preview'
    });
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('priorities', hash.priorities);
    controller.set('statuses', hash.statuses);
  },
  actions: {
    editDTD() {
      this.transitionTo('dtds.dtd', this.currentModel.model.get('id'));
    },
  }
});

export default DtdNewRoute;

