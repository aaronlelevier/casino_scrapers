import Ember from 'ember';
const { get, computed, Component } = Ember;
import config from 'bsrs-ember/config/environment';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_MS = config.APP.POWER_SELECT_DEBOUNCE;

export default Component.extend({
  classNames: ['animated-fast', 'fadeIn'],
  searchRepo: task(function * (search) {
    if (Ember.isBlank(search)) { return []; }
    yield timeout(DEBOUNCE_MS);
    const model = get(this, 'model');
    const repo = get(this, 'workOrderRepo');
    const json = yield repo['findWorkOrderProvider'](search, model.get('category').get('id'));
    return json;
  }).restartable(),
  actions: {
    selected(item) {
      const model = get(this, 'model');
      model['change_provider'](item);
    }
  }
});
