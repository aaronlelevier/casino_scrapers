import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';

export default TabRoute.extend({
  simpleStore: Ember.inject.service(),
  repository: inject('tenant'),
  redirectRoute: Ember.computed(function() {
    return 'admin';
  }),
  module: Ember.computed(function() {
    return 'tenant';
  }),
  templateModelField: Ember.computed(function() {
    return 'translated_title';
  }),
  model(params) {
    const repository = this.get('repository');
    return repository.findById(params.id);
  }
});