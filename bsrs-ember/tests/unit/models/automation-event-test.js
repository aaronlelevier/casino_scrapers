import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import RED from 'bsrs-ember/vendor/defaults/automation-event';

var store, event;

moduleFor('model:automation-event', 'Unit | Model | automation-event', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-event']);
    run(() => {
      event = store.push('automation-event', {id: RED.idOne});
    });
  }
});

test('dirty test | key', assert => {
  assert.equal(event.get('isDirty'), false);
  event.set('key', 'wat');
  assert.equal(event.get('isDirty'), true);
  event.set('key', '');
  assert.equal(event.get('isDirty'), false);
});