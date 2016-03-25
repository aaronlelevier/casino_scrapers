import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';
import FindById from 'bsrs-ember/mixins/route/findById2';

export default Ember.Route.extend(FindById, PriorityMixin, StatusMixin, {
  repository: inject('dtd'),
  i18n: Ember.inject.service(),
  redirectRoute: 'dtds',
  closeTabRedirect: 'admin',
  module: 'dtd',
  displayText: Ember.computed(function() { return this.get('i18n').t('admin.dtd.one'); }),
  transitionCB() {
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
    this.get('tabList').createSingleTab({
      routeName: this.routeName,
      module: this.get('module'),
      displayText: this.get('displayText'),
      redirectRoute: this.get('redirectRoute'),
      transitionCB: this.transitionCB.bind(this),
      model_id: model.pk,
      closeTabRedirect: this.get('closeTabRedirect'),
    });
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
