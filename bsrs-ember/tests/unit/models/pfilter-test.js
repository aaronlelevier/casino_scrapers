import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, profile, profile_filter, person, run = Ember.run;

module('unit: profile test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:pfilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      profile = store.push('profile', {id: PD.idOne, assignee_fk: PersonD.idOne});
      person = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
      profile_filter = store.push('pfilter', {id: PFD.idOne});
    });
  }
});

test('dirty test | key', assert => {
  assert.equal(profile_filter.get('isDirty'), false);
  profile_filter.set('key', 'wat');
  assert.equal(profile_filter.get('isDirty'), true);
  profile_filter.set('key', '');
  assert.equal(profile_filter.get('isDirty'), false);
});

test('dirty test | context', assert => {
  assert.equal(profile_filter.get('isDirty'), false);
  profile_filter.set('context', 'wat');
  assert.equal(profile_filter.get('isDirty'), true);
  profile_filter.set('context', '');
  assert.equal(profile_filter.get('isDirty'), false);
});

test('dirty test | field', assert => {
  assert.equal(profile_filter.get('isDirty'), false);
  profile_filter.set('field', 'wat');
  assert.equal(profile_filter.get('isDirty'), true);
  profile_filter.set('field', '');
  assert.equal(profile_filter.get('isDirty'), false);
});

test('dirty test | criteria', assert => {
  assert.equal(profile_filter.get('criteriaIsDirty'), false);
  profile_filter.set('criteria_fks', [TD.priorityOneId]);
  profile_filter.set('criteria_ids', [TD.priorityOneId]);
  assert.equal(profile_filter.get('criteriaIsDirty'), false);
  assert.equal(profile_filter.get('isDirtyOrRelatedDirty'), false);
  profile_filter.set('criteria_ids', []);
  assert.equal(profile_filter.get('criteriaIsDirty'), true);
  assert.equal(profile_filter.get('isDirtyOrRelatedDirty'), true);
});

test('related dirty', assert => {
  assert.equal(profile_filter.get('isDirty'), false);
  profile_filter.set('field', 'wat');
  assert.equal(profile_filter.get('isDirty'), true);
  assert.equal(profile_filter.get('isDirtyOrRelatedDirty'), true);
  assert.equal(profile_filter.get('isNotDirtyOrRelatedNotDirty'), false);
});

// criteria method tests

test('add_criteria', assert => {
  assert.deepEqual(profile_filter.get('criteria_fks'), []);
  profile_filter.add_criteria(TD.priorityOneId);
  assert.deepEqual(profile_filter.get('criteria_fks'), [TD.priorityOneId]);
  // indempotent - b/c unique id's only
  profile_filter.add_criteria(TD.priorityOneId);
  assert.deepEqual(profile_filter.get('criteria_fks'), [TD.priorityOneId]);
});

test('remove_criteria', assert => {
  profile_filter.add_criteria(TD.priorityOneId);
  assert.deepEqual(profile_filter.get('criteria_fks'), [TD.priorityOneId]);
  profile_filter.remove_criteria(TD.priorityOneId);
  assert.deepEqual(profile_filter.get('criteria_fks'), []);
  // fails gracefull if not present
  profile_filter.remove_criteria(TD.priorityOneId);
  assert.deepEqual(profile_filter.get('criteria_fks'), []);
});

test('serialize', assert => {
    run(() => {
      profile_filter = store.push('pfilter', {id: PFD.idOne, key: PFD.keyOne, context: PFD.contextOne, field: PFD.fieldOne, criteria_fks: [TD.priorityOneId]});
    });
  let data = profile_filter.serialize();
  assert.equal(data.id, PFD.idOne);
  assert.equal(data.key, PFD.keyOne);
  assert.equal(data.context, PFD.contextOne);
  assert.equal(data.field, PFD.fieldOne);
  assert.deepEqual(data.criteria, [TD.priorityOneId]);
});
