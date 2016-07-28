import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AFD from 'bsrs-ember/vendor/defaults/afilter';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, profile, afilter, run = Ember.run;

module('unit: afilter model test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:afilter']);
    run(() => {
      afilter = store.push('afilter', {id: AFD.idOne});
    });
  }
});

test('dirty test | key', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('key', 'wat');
  assert.equal(afilter.get('isDirty'), true);
  afilter.set('key', '');
  assert.equal(afilter.get('isDirty'), false);
});

test('dirty test | key_is_i18n', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('key_is_i18n', true);
  assert.equal(afilter.get('isDirty'), true);
  afilter.set('key_is_i18n', undefined);
  assert.equal(afilter.get('isDirty'), false);
});

test('dirty test | context', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('context', 'wat');
  assert.equal(afilter.get('isDirty'), true);
  afilter.set('context', '');
  assert.equal(afilter.get('isDirty'), false);
});

test('dirty test | field', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('field', 'wat');
  assert.equal(afilter.get('isDirty'), true);
  afilter.set('field', '');
  assert.equal(afilter.get('isDirty'), false);
});

test('aaron dirty test | lookups', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('lookups', 'wat');
  assert.equal(afilter.get('isDirty'), true);
  afilter.set('lookups', undefined);
  assert.equal(afilter.get('isDirty'), false);
});

test('related dirty', assert => {
  assert.equal(afilter.get('isDirty'), false);
  afilter.set('field', 'wat');
  assert.equal(afilter.get('isDirty'), true);
  assert.equal(afilter.get('isDirtyOrRelatedDirty'), true);
  assert.equal(afilter.get('isNotDirtyOrRelatedNotDirty'), false);
});
