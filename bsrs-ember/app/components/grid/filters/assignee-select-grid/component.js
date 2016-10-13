import Ember from 'ember';
const { get } = Ember;
import inject from 'bsrs-ember/utilities/inject';
import { task, timeout } from 'ember-concurrency';
import config from 'bsrs-ember/config/environment';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

export default Ember.Component.extend({
  repository: inject('person'),
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const repo = this.get('repository');
    const json = yield repo.findPeople(search);
    return json;
  }).restartable(),
  actions: {
    selected(person) {
      this.get('updateGridFilterParams')(get(this, 'column'), person);
    }
  }
});
