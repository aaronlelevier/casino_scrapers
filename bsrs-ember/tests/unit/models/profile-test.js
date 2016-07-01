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

test('dirty test | order', assert => {
  assert.equal(profile.get('isDirty'), false);
  profile.set('order', 1);
  assert.equal(profile.get('isDirty'), true);
  profile.set('order', 0);
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
    order: PD.orderOne,
    assignee_id: PD.assigneeOne
  });
  let ret = profile.serialize();
  assert.equal(ret.id, PD.idOne);
  assert.equal(ret.description, PD.descOne);
  assert.equal(ret.order, PD.orderOne);
  assert.equal(ret.assignee_id, PD.assigneeOne);
});

test('serialize | default order if undefined', assert => {
  profile = store.push('profile', {
    id: PD.idOne,
    order: undefined,
  });
  let ret = profile.serialize();
  assert.equal(ret.order, PD.orderDefault);
});