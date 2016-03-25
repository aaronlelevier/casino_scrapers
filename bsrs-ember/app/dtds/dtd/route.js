import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';
import FindById from 'bsrs-ember/mixins/route/findById2';

export default Ember.Route.extend(FindById, PriorityMixin, StatusMixin, {
  repository: inject('dtd'),
  redirectRoute: Ember.computed(function() { return 'dtds'; }),
  closeTabRedirect: Ember.computed(function() { return 'admin'; }),
  modelName: Ember.computed(function() { return 'dtd'; }),
  templateModelField: Ember.computed(function() { return 'description'; }),
  transitionCallback() {
    //to prevent transitionTo in application route
    return;
  },
  tabList: Ember.inject.service(),
  model(params){
    const store = this.get('store');
    store.push('dtd-header', {id: 1, message: ''});
    const pk = params.dtd_id;
    const repository = this.get('repository');
    let dtd = repository.fetch(pk);
    const priorities = this.get('priorities');
    const statuses = this.get('statuses');
    return this.findByIdScenario(dtd, pk, {statuses:statuses, priorities:priorities });
  },
  afterModel(model, transition) {
    const store = this.get('store');
    const model_id = model.model ? model.model.filter_value : model.get('id');
    const id = 'dtd123';
    store.push('dtd', {id: model_id, singleTabId: id});
    this.get('tabList').createTab(id,
      this.routeName,
      this.get('modelName'),
      this.get('templateModelField'),
      this.get('redirectRoute'),
      false,
      this.transitionCallback.bind(this),
      model_id,
      this.get('closeTabRedirect'),
      'Decision Tree'
    );
  },
  renderTemplate(){
    this.render('dtds.dtd', {
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
    error(){
      return this.transitionTo('dtds.dtd-error');
    }
  }
});
