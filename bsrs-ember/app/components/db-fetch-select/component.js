import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';
const { computed } = Ember;

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

var DBFetch = Ember.Component.extend({
  i18n: Ember.inject.service(),
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const repo = this.get('repository');
    const searchRepo = this.get('searchMethod');
    const json = yield repo[searchRepo](search);
    return json;
  }).restartable(),
  placeholderText: Ember.computed(function() {
    return this.get('placeholder') ? this.get('placeholder') : this.get('i18n').t('power.select.select');
  }),
  actions: {
    selected(item) {
      const model = this.get('model');
      const change_func = this.get('change_func');
      model[change_func](item);
    }
  }
});

export default DBFetch;

