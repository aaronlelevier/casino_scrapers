import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';

var store, profile, run = Ember.run;

module('unit: profile test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile']);
    run(function() {
    profile = store.push('profile', {id: PD.idOne});
  });
}
});

test('dirty test | description', assert => {
  assert.equal(profile.get('isDirty'), false);
  profile.set('description', 'wat');
  assert.equal(profile.get('isDirty'), true);
  profile.set('description', '');
  assert.equal(profile.get('isDirty'), false);
});

test('dirty test | assignee_id', assert => {
  assert.equal(profile.get('isDirty'), false);
  profile.set('assignee_id', 1);
  assert.equal(profile.get('isDirty'), true);
  profile.set('assignee_id', undefined);
  assert.equal(profile.get('isDirty'), false);
});

test('serialize', assert => {
  profile = store.push('profile', {
    id: PD.idOne,
    description: PD.descOne,
    assignee_id: PD.assigneeOne
  });
  let ret = profile.serialize();
  assert.equal(ret.id, PD.idOne);
  assert.equal(ret.description, PD.descOne);
  assert.equal(ret.assignee_id, PD.assigneeOne);
});
