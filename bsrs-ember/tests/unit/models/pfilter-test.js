import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import CD from 'bsrs-ember/vendor/defaults/criteria';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import PJFD from 'bsrs-ember/vendor/defaults/pfilter-join-criteria';

var store, pfilter, criteria;

module('unit: pfilter model test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:pfilter', 'model:pfilter-join-criteria', 'model:criteria', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      pfilter = store.push('pfilter', {id: PFD.idOne});
      criteria = store.push('criteria', {id: CD.idOne});
    });
  }
});

test('dirty test | source_id', assert => {
  assert.equal(pfilter.get('isDirty'), false);
  pfilter.set('source_id', 'wat');
  assert.equal(pfilter.get('isDirty'), true);
  pfilter.set('source_id', '');
  assert.equal(pfilter.get('isDirty'), false);
});

// criteria method tests
test('criteria property should return all associated criteria. also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne]});
    store.push('criteria', {id: CD.idOne});
  });
  let criteria = pfilter.get('criteria');
  assert.equal(criteria.get('length'), 1);
  assert.deepEqual(pfilter.get('criteria_ids'), [CD.idOne]);
  assert.deepEqual(pfilter.get('pfilter_criteria_ids'), [PJFD.idOne]);
  assert.equal(criteria.objectAt(0).get('id'), CD.idOne);
});

test('criteria property is not dirty when no pf present (undefined)', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: undefined});
    store.push('criteria', {id: CD.idOne});
  });
  assert.equal(pfilter.get('criteria').get('length'), 0);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
});

test('criteria property is not dirty when no pf present (empty array)', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: []});
    store.push('criteria', {id: CD.idOne});
  });
  assert.equal(pfilter.get('criteria').get('length'), 0);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
});

test('remove_criteria - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    store.push('criteria', {id: CD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne]});
  });
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter.get('pfilter_criteria_ids').length, 1);
  assert.equal(pfilter.get('pfilter_criteria_fks').length, 1);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.remove_criteria(CD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 0);
  assert.equal(pfilter.get('pfilter_criteria_ids').length, 0);
  assert.equal(pfilter.get('pfilter_criteria_fks').length, 1);
  assert.ok(pfilter.get('criteriaIsDirty'));
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
});

test('add_criteria - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    store.push('criteria', {id: CD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne]});
  });
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter.get('pfilter_criteria_ids').length, 1);
  assert.equal(pfilter.get('pfilter_criteria_fks').length, 1);
  assert.deepEqual(pfilter.get('criteria_ids'), [CD.idOne]);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.add_criteria({id: CD.idTwo});
  assert.equal(pfilter.get('criteria').get('length'), 2);
  assert.equal(pfilter.get('pfilter_criteria_ids').length, 2);
  assert.equal(pfilter.get('pfilter_criteria_fks').length, 1);
  assert.deepEqual(pfilter.get('criteria_ids'), [CD.idOne, CD.idTwo]);
  assert.equal(pfilter.get('criteria').objectAt(0).get('id'), CD.idOne);
  assert.equal(pfilter.get('criteria').objectAt(1).get('id'), CD.idTwo);
  assert.ok(pfilter.get('criteriaIsDirty'));
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
});

test('saveCriteria - will reset the previous pf with multiple assignments', (assert) => {
  let criteria_unused = {id: CD.unusedId};
  run(() => {
    store.push('criteria', {id: CD.idOne});
    store.push('criteria', {id: CD.idTwo});
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    store.push('pfilter-join-criteria', {id: PJFD.idTwo, pfilter_pk: PFD.idOne, criteria_pk: CD.idTwo});
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne, PJFD.idTwo]});
  });
  assert.equal(pfilter.get('criteria').get('length'), 2);
  pfilter.remove_criteria(CD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('criteriaIsDirty'));
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  pfilter.saveCriteria();
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('isNotDirty'));
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.add_criteria(criteria_unused);
  assert.equal(pfilter.get('criteria').get('length'), 2);
  assert.ok(pfilter.get('criteriaIsDirty'));
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  pfilter.saveCriteria();
  assert.equal(pfilter.get('criteria').get('length'), 2);
  assert.ok(pfilter.get('isNotDirty'));
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackCriteria - multiple assignments with the same pf will rollbackCriteria correctly', (assert) => {
  let pfilter_two;
  run(() => {
    store.push('pfilter-join-criteria', {id: PJFD.idOne, pfilter_pk: PFD.idOne, criteria_pk: CD.idOne});
    store.push('pfilter-join-criteria', {id: PJFD.idTwo, pfilter_pk: PFD.idTwo, criteria_pk: CD.idOne});
    store.push('criteria', {id: CD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne, pfilter_criteria_fks: [PJFD.idOne]});
    pfilter_two = store.push('pfilter', {id: PFD.idTwo, pfilter_criteria_fks: [PJFD.idTwo]});
  });
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter_two.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter_two.get('criteriaIsNotDirty'));
  assert.ok(pfilter_two.get('isNotDirtyOrRelatedNotDirty'));
  pfilter_two.remove_criteria(CD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter_two.get('criteria').get('length'), 0);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter_two.get('criteriaIsDirty'));
  assert.ok(pfilter_two.get('isDirtyOrRelatedDirty'));
  pfilter_two.rollbackCriteria();
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter_two.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter_two.get('criteriaIsNotDirty'));
  assert.ok(pfilter_two.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.remove_criteria(CD.idOne);
  assert.equal(pfilter.get('criteria').get('length'), 0);
  assert.equal(pfilter_two.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('criteriaIsDirty'));
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  assert.ok(pfilter_two.get('criteriaIsNotDirty'));
  assert.ok(pfilter_two.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.rollbackCriteria();
  assert.equal(pfilter.get('criteria').get('length'), 1);
  assert.equal(pfilter_two.get('criteria').get('length'), 1);
  assert.ok(pfilter.get('criteriaIsNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter_two.get('criteriaIsNotDirty'));
  assert.ok(pfilter_two.get('isNotDirtyOrRelatedNotDirty'));
});
