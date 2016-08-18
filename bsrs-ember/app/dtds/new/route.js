import Ember from 'ember';
const { run } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';
import PriorityMixin from 'bsrs-ember/mixins/route/priority';
import StatusMixin from 'bsrs-ember/mixins/route/status';

const detail_msg = 'admin.dtd.empty-detail';

var DtdNewRoute = Ember.Route.extend(PriorityMixin, StatusMixin, {
  i18n: Ember.inject.service(),
  tabList: Ember.inject.service(),
  uuid: injectUUID('uuid'),
  repository: inject('dtd'),
  redirectRoute: 'dtds',
  closeTabRedirect: 'admin',
  module: 'dtd',
  displayText: Ember.computed(function() { return this.get('i18n').t('admin.dtd.one'); }),
  transitionCB: function() {},
  model(params) {
    const store = this.get('simpleStore');
    run(() => {
      store.push('dtd-header', {id: 1, message: ''});
    });
    const priorities = this.get('priorities');
    const statuses = this.get('statuses');
    const new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    // let model = this.get('simpleStore').find('dtd', {new_pk: new_pk}).objectAt(0);
    // if(!model){
    const uuid = this.get('uuid');
    const m2m_id = uuid.v4();
    let model = repository.create(new_pk, { dtd_links_fks: [m2m_id] });
    const link_id = uuid.v4();
    const link = store.push('link', {id: link_id, order: 0});
    store.push('dtd-link', {id: m2m_id, dtd_pk: model.get('id'), link_pk: link_id});
    // }
    return {
      model: model,
      statuses: statuses,
      priorities: priorities,
      repository: repository
    };
  },
  afterModel(model, transition) {
    const model_id = model.model ? model.model.get('id') : model.get('id');
    this.get('tabList').createSingleTab({
      routeName: this.routeName,
      module: this.get('module'),
      displayText: this.get('displayText'),
      redirectRoute: this.get('redirectRoute'),
      transitionCB: this.transitionCB.bind(this),
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
    controller.setProperties(hash);
  },
  actions: {
    editDTD() {
      this.transitionTo('dtds.dtd', this.currentModel.model.get('id'));
    },
  }
});

export default DtdNewRoute;
