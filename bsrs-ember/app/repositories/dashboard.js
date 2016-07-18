import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';
import { DASHBOARD_URL } from 'bsrs-ember/utilities/urls';

var DashboardRepo = Ember.Object.extend({
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  type: Ember.computed(function() {
    return 'general';
  }),
  detail() {
    let store = this.get('simpleStore');
    return PromiseMixin.xhr(`${DASHBOARD_URL}`, 'GET').then((response) => {
      const pk = this.get('uuid').v4();
      return store.push('dashboard', {id: pk, settings: response.settings});
    });
  }
});

export default DashboardRepo;
