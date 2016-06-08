import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';

export default TabRoute.extend({
  simpleStore: Ember.inject.service(),
  repository: inject('setting'),
  redirectRoute: Ember.computed(function() {
    return 'admin';
  }),
  module: Ember.computed(function() {
    return 'setting';
  }),
  templateModelField: Ember.computed(function() {
    return 'translated_title';
  }),
  model(params) {
    const id = params.id;
    const repository = this.get('repository');
    return repository.findById(id);
  }
});