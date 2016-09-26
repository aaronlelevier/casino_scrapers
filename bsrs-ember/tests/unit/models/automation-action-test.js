import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import AATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import PersonD from 'bsrs-ember/vendor/defaults/person';

var store, action;

moduleFor('model:automation-action', 'Unit | Model | automation-action', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:person']);
  }
});

test('action has a related action type', (assert) => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: AATD.idOne});
    store.push('automation-action-type', {id: AATD.idOne, key: AATD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type.id'), AATD.idOne);
  assert.equal(action.get('type.key'), AATD.keyOne);
});

test('amk action has a related assignee', (assert) => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: AATD.idOne});
    store.push('person', {id: PersonD.idOne, fullname: PersonD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.equal(action.get('assignee.fullname'), PersonD.fullname);
});
