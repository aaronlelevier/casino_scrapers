import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import AFD from 'bsrs-ember/vendor/defaults/afilter';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, profile, pfilter, afilter, person, run = Ember.run;

module('unit: pfilter model test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:pfilter', 'model:afilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      profile = store.push('profile', {id: PD.idOne, assignee_fk: PersonD.idOne});
      person = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
      pfilter = store.push('pfilter', {id: PFD.idOne});
    });
  }
});

test('dirty test | lookups', assert => {
  assert.equal(pfilter.get('isDirty'), false);
  pfilter.set('lookups', 'wat');
  assert.equal(pfilter.get('isDirty'), true);
  pfilter.set('lookups', '');
  assert.equal(pfilter.get('isDirty'), false);
});

test('dirty test | criteria', assert => {
  assert.equal(pfilter.get('criteriaIsDirty'), false);
  pfilter.set('criteria_fks', [TD.priorityOneId]);
  pfilter.set('criteria_ids', [TD.priorityOneId]);
  assert.equal(pfilter.get('criteriaIsDirty'), false);
  pfilter.set('criteria_ids', []);
  assert.equal(pfilter.get('criteriaIsDirty'), true);
});

test('related dirty', assert => {
  assert.equal(pfilter.get('isDirty'), false);
  pfilter.set('lookups', 'wat');
  assert.equal(pfilter.get('isDirty'), true);
  assert.equal(pfilter.get('isDirtyOrRelatedDirty'), true);
  assert.equal(pfilter.get('isNotDirtyOrRelatedNotDirty'), false);
});

// criteria method tests

test('add_criteria', assert => {
  assert.deepEqual(pfilter.get('criteria_fks'), []);
  pfilter.add_criteria(TD.priorityOneId);
  assert.deepEqual(pfilter.get('criteria_fks'), [TD.priorityOneId]);
  // indempotent - b/c unique id's only
  pfilter.add_criteria(TD.priorityOneId);
  assert.deepEqual(pfilter.get('criteria_fks'), [TD.priorityOneId]);
});

test('remove_criteria', assert => {
  pfilter.add_criteria(TD.priorityOneId);
  assert.deepEqual(pfilter.get('criteria_fks'), [TD.priorityOneId]);
  pfilter.remove_criteria(TD.priorityOneId);
  assert.deepEqual(pfilter.get('criteria_fks'), []);
  // fails gracefull if not present
  pfilter.remove_criteria(TD.priorityOneId);
  assert.deepEqual(pfilter.get('criteria_fks'), []);
});

test('serialize', assert => {
    run(() => {
      pfilter = store.push('pfilter', {id: PFD.idOne, lookups: PFD.lookupsEmpty, criteria_fks: [TD.priorityOneId]});
    });
  let data = pfilter.serialize();
  assert.equal(data.id, PFD.idOne);
  assert.equal(data.lookups, PFD.lookupsEmpty);
  assert.deepEqual(data.criteria, [TD.priorityOneId]);
});

/* afilter */
test('related afilter should return one afilter for a pfilter', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, afilter_fk: AFD.idOne});
    afilter = store.push('afilter', {id: AFD.idOne, pfilters: [PFD.idOne]});
  });
  assert.equal(pfilter.get('afilter').get('id'), AFD.idOne);
});

test('change_afilter - will update the afilters afilter and dirty the model', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, afilter_fk: undefined});
    store.push('afilter', {id: AFD.idOne, pfilters: []});
    inactive_afilter = store.push('afilter', {id: AFD.idTwo, pfilters: []});
  });
  assert.equal(pfilter.get('afilter'), undefined);
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pfilter.get('afilterIsNotDirty'));
  pfilter.change_afilter({id: AFD.idOne});
  assert.equal(pfilter.get('afilter_fk'), undefined);
  assert.equal(pfilter.get('afilter.id'), AFD.idOne);
  pfilter.change_afilter({id: inactive_afilter.get('id')});
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  assert.ok(pfilter.get('afilterIsDirty'));
  assert.equal(pfilter.get('afilter_fk'), undefined);
  assert.equal(pfilter.get('afilter.id'), AFD.idTwo);
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  assert.ok(pfilter.get('afilterIsDirty'));
});

test('saveAfilter - afilter - pfilterwill set afilter_fk to current afilter id', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, afilter_fk: AFD.idOne});
    store.push('afilter', {id: AFD.idOne, pfilters: [PFD.idOne]});
    inactive_afilter = store.push('afilter', {id: AFD.idTwo, pfilters: []});
  });
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(pfilter.get('afilter_fk'), AFD.idOne);
  assert.equal(pfilter.get('afilter.id'), AFD.idOne);
  pfilter.change_afilter({id: inactive_afilter.get('id')});
  assert.equal(pfilter.get('afilter_fk'), AFD.idOne);
  assert.equal(pfilter.get('afilter.id'), AFD.idTwo);
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  assert.ok(pfilter.get('afilterIsDirty'));
  pfilter.saveAfilter();
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!pfilter.get('afilterIsDirty'));
  assert.equal(pfilter.get('afilter_fk'), AFD.idTwo);
  assert.equal(pfilter.get('afilter.id'), AFD.idTwo);
});

test('rollbackAfilter - afilter - pfilterwill set afilter to current afilter_fk', (assert) => {
  run(() => {
    pfilter = store.push('pfilter', {id: PFD.idOne, afilter_fk: AFD.idOne});
    store.push('afilter', {id: AFD.idOne, pfilters: [PFD.idOne]});
    inactive_afilter = store.push('afilter', {id: AFD.idTwo, apfilters: []});
  });
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(pfilter.get('afilter_fk'), AFD.idOne);
  assert.equal(pfilter.get('afilter.id'), AFD.idOne);
  pfilter.change_afilter({id: inactive_afilter.get('id')});
  assert.equal(pfilter.get('afilter_fk'), AFD.idOne);
  assert.equal(pfilter.get('afilter.id'), AFD.idTwo);
  assert.ok(pfilter.get('isDirtyOrRelatedDirty'));
  assert.ok(pfilter.get('afilterIsDirty'));
  pfilter.rollbackAfilter();
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!pfilter.get('afilterIsDirty'));
  assert.equal(pfilter.get('afilter.id'), AFD.idOne);
  assert.equal(pfilter.get('afilter_fk'), AFD.idOne);
});
