import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';

export default TabRoute.extend({
  simpleStore: Ember.inject.service(),
  repository: inject('tenant'),
  redirectRoute: 'admin',
  module: 'tenant',
  templateModelField: 'translated_title',
  model(params) {
    const repository = this.get('repository');
    return repository.findById(params.id);
  }
});