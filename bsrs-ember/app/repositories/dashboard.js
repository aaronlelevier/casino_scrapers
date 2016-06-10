import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import injectUUID from 'bsrs-ember/utilities/uuid';

var PREFIX = config.APP.NAMESPACE;
var DASHBOARD_URL = '/dashboard';

var DashboardRepo = Ember.Object.extend({
  uuid: injectUUID('uuid'),
  simpleStore: Ember.inject.service(),
  type: Ember.computed(function() {
    return 'general';
  }),
  detail() {
    let store = this.get('simpleStore');
    PromiseMixin.xhr(`${PREFIX}${DASHBOARD_URL}/`, 'GET').then((response) => {
      const pk = this.get('uuid').v4();
      store.push('dashboard', {id: pk, settings: response.settings});
    });
    return store.findOne('dashboard');
  }
});

export default DashboardRepo;
