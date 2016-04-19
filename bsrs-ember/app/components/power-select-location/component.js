import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

var DBFetch = Ember.Component.extend({
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const repo = this.get('repository');
    const json = yield repo['findWithQuery'](search);
    return json;
  }).restartable(),
  actions: {
    change_location(location) {
      const ticket = this.get('ticket');
      const locationId = location.get('id');
      ticket.change_location({id: locationId});
      this.set('selected', location);
    }
  }
});

export default DBFetch;

