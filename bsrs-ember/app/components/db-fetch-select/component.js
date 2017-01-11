import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';
const { computed } = Ember;

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

var DBFetch = Ember.Component.extend({
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const repo = this.get('repository');
    const searchRepo = this.get('searchMethod');
    const json = yield repo[searchRepo](search);
    return json;
  }).restartable(),
  actions: {
    selected(item) {
      const model = this.get('model');
      const change_func = this.get('change_func');
      const remove_func = this.get('remove_func');
      if (item) {
        model[change_func](item);
      } else {
        const previousId = model.get(this.get('valuePath')+'.id');
        if (previousId) {
          model[remove_func](previousId);
        }
      }
    }
  }
});

export default DBFetch;

