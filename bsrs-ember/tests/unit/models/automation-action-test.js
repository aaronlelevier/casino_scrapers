import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AAD from 'bsrs-ember/vendor/defaults/automation-action';
import ATD from 'bsrs-ember/vendor/defaults/automation-action-type';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import TPD from 'bsrs-ember/vendor/defaults/ticket-priority';

var store, action, actionType, type, assignee, priority;

moduleFor('model:automation-action', 'Unit | Model | automation-action', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation-action', 'model:automation-action-type', 'model:person', 'model:ticket-priority', 'service:person-current', 'service:translations-fetcher', 'service:i18n', 'validator:presence', 'validator:unique-username', 'validator:length', 'validator:format', 'validator:has-many', 'validator:automation-action-type']);
  }
});

// Action - ActionType

test('action has a related action type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, key: ATD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type.id'), ATD.idOne);
  assert.equal(action.get('type.key'), ATD.keyOne);
});

test('change_type and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('typeIsNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type.id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('typeIsDirty'));
});

test('rollback type will revert and reboot the dirty type to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type.id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type.id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('type.id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated action type to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type.id'), ATD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('type.id'), ATD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('type.id'), ATD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_type - removes the action type from the action', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    actionType = store.push('automation-action-type', {id: ATD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('type.id'), ATD.idOne);
  action.remove_type(ATD.idOne);
  assert.deepEqual(actionType.get('actions'), []);
  assert.equal(action.get('type.id'), undefined);
});

// Action - Assignee

test('action has a related assignee', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, type_fk: ATD.idOne});
    store.push('person', {id: PersonD.idOne, fullname: PersonD.fullname, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.equal(action.get('assignee.fullname'), PersonD.fullname);
});

test('change_assignee and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    assignee = store.push('person', {id: PersonD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('assigneeIsNotDirty'));
  action.change_assignee({id: PersonD.idOne});
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('assigneeIsDirty'));
  assert.ok(assignee.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback assignee will revert and reboot the dirty assignee to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PersonD.idTwo});
  assert.equal(action.get('assignee.id'), PersonD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for assignee to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('assignee.id'), PersonD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_assignee({id: PersonD.idTwo});
  assert.equal(action.get('assignee.id'), PersonD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('assignee.id'), PersonD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

// validations

test('type validation - action must have a type to be valid', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, foo: 'bar'});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idOne});
  assert.equal(action.get('validations.isValid'), true);
});

test('type validation - assignee - if the type is assignee, a related assignee is required', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  assert.equal(action.get('validations.isValid'), false);
  action.change_type({id: ATD.idTwo});
  assert.equal(action.get('validations.isValid'), true);
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  assert.equal(action.get('validations.isValid'), false);
  action.change_assignee({id: PersonD.idOne});
  assert.equal(action.get('validations.isValid'), true);
  // changing to a different type should remove the 'assignee required' validation
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  assert.equal(action.get('validations.isValid'), true);
});

// Action - Priority

test('action has a related priority', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: ATD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, key: TPD.keyOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority.id'), TPD.idOne);
  assert.equal(action.get('priority.key'), TPD.keyOne);
});

test('change_priority and dirty tracking', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
    priority = store.push('ticket-priority', {id: TPD.idOne});
  });
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(action.get('priorityIsNotDirty'));
  action.change_priority({id: TPD.idOne});
  assert.equal(action.get('priority.id'), TPD.idOne);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  assert.ok(action.get('priorityIsDirty'));
});

test('rollback priority will revert and reboot the dirty priority to clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority.id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority.id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.rollback();
  assert.equal(action.get('priority.id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated for priority to save model and make it clean', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne, priority_fk: TPD.idOne});
    store.push('ticket-priority', {id: TPD.idOne, actions: [AAD.idOne]});
  });
  assert.equal(action.get('priority.id'), TPD.idOne);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
  action.change_priority({id: TPD.idTwo});
  assert.equal(action.get('priority.id'), TPD.idTwo);
  assert.ok(action.get('isDirtyOrRelatedDirty'));
  action.saveRelated();
  assert.equal(action.get('priority.id'), TPD.idTwo);
  assert.ok(action.get('isNotDirtyOrRelatedNotDirty'));
});

test('serialize - should only send the content fields that are relevant based on the type', assert => {
  run(() => {
    action = store.push('automation-action', {id: AAD.idOne});
  });
  action.change_assignee({id: PersonD.idOne});
  action.change_priority({id: TPD.idOne});
  action.change_type({id: ATD.idOne, key: ATD.keyOne});
  assert.deepEqual(action.serialize().content, {assignee: PersonD.idOne});
  action.change_type({id: ATD.idTwo, key: ATD.keyTwo});
  assert.deepEqual(action.serialize().content, {priority: TPD.idOne});
});
