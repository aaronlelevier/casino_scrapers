import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

const detail_msg = 'admin.dtd.empty-detail';

var DtdNewRoute = Ember.Route.extend({
  i18n: Ember.inject.service(),
  tabList: Ember.inject.service(),
  repository: inject('dtd'),
  redirectRoute: 'dtds',
  closeTabRedirect: 'admin',
  module: 'dtd',
  displayText: Ember.computed(function() { return this.get('i18n').t('admin.dtd.one'); }),
  transitionCallback: function() {},
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
    const model_id = model.model ? model.model.get('id') : model.get('id');
    this.get('tabList').createSingleTab({
      routeName: this.routeName,
      module: this.get('module'),
      displayText: this.get('displayText'),
      redirectRoute: this.get('redirectRoute'),
      transitionCB: this.transitionCallback.bind(this),
      model_id: model_id,
      closeTabRedirect: this.get('closeTabRedirect'),
      newModel: true
    });
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

