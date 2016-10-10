import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import { task, timeout } from 'ember-concurrency';
import config from 'bsrs-ember/config/environment';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

export default Ember.Component.extend({
  repository: inject('location'),
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const repo = this.get('repository');
    const json = yield repo.findTicket(search);
    return json;
  }).restartable(),
  selectedLocation: Ember.computed(function() {
    const gridIdInParams = this.get('gridIdInParams');
    if ('location.name' in gridIdInParams) {
      return gridIdInParams['location.name'];
    }
  }),
  actions: {
    selected(location) {
      this.set('selectedLocation', location);
      this.get('updateGridFilterParams')(location);
    }
  }
});
