import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import assignmentD from 'bsrs-ember/vendor/defaults/assignment';
import assignmentF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import AssignmentFilterD from 'bsrs-ember/vendor/defaults/assignmentfilter';
import assignmentJoinFilterD from 'bsrs-ember/vendor/defaults/assignment-join-filter';

var store, assignment, inactive_assignee;

moduleFor('model:assignment', 'Unit | Model | assignment', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-join-filter', 'model:assignmentfilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      assignment = store.push('assignment', {id: assignmentD.idOne});
    });
  }
});

test('dirty test | description', assert => {
  assert.equal(assignment.get('isDirty'), false);
  assignment.set('description', 'wat');
  assert.equal(assignment.get('isDirty'), true);
  assignment.set('description', '');
  assert.equal(assignment.get('isDirty'), false);
});

test('serialize', assert => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, description: assignmentD.descOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [assignmentD.idOne]});
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  });
  let ret = assignment.serialize();
  assert.equal(ret.id, assignmentD.idOne);
  assert.equal(ret.description, assignmentD.descOne);
  assert.equal(ret.assignee, assignmentD.assigneeOne);
});

/* assignee */
test('related person should return one person for a assignment', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [assignmentD.idOne]});
  });
  assert.equal(assignment.get('assignee').get('id'), PersonD.idOne);
});

test('change_assignee - will update the persons assignee and dirty the model', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: undefined});
    store.push('person', {id: PersonD.idOne, assignments: []});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.equal(assignment.get('assignee'), undefined);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment.get('assigneeIsNotDirty'));
  assignment.change_assignee({id: PersonD.idOne});
  assert.equal(assignment.get('assignee_fk'), undefined);
  assert.equal(assignment.get('assignee.id'), PersonD.idOne);
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.ok(assignment.get('assigneeIsDirty'));
  assert.equal(assignment.get('assignee_fk'), undefined);
  assert.equal(assignment.get('assignee.id'), PersonD.idTwo);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.ok(assignment.get('assigneeIsDirty'));
});

test('saveAssignee - assignee - assignmentwill set assignee_fk to current assignee id', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [assignmentD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('assignee_fk'), PersonD.idOne);
  assert.equal(assignment.get('assignee.id'), PersonD.idOne);
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(assignment.get('assignee_fk'), PersonD.idOne);
  assert.equal(assignment.get('assignee.id'), PersonD.idTwo);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.ok(assignment.get('assigneeIsDirty'));
  assignment.saveAssignee();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!assignment.get('assigneeIsDirty'));
  assert.equal(assignment.get('assignee_fk'), PersonD.idTwo);
  assert.equal(assignment.get('assignee.id'), PersonD.idTwo);
});

test('rollbackAssignee - assignee - assignmentwill set assignee to current assignee_fk', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [assignmentD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('assignee_fk'), PersonD.idOne);
  assert.equal(assignment.get('assignee.id'), PersonD.idOne);
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(assignment.get('assignee_fk'), PersonD.idOne);
  assert.equal(assignment.get('assignee.id'), PersonD.idTwo);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.ok(assignment.get('assigneeIsDirty'));
  assignment.rollbackAssignee();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!assignment.get('assigneeIsDirty'));
  assert.equal(assignment.get('assignee.id'), PersonD.idOne);
  assert.equal(assignment.get('assignee_fk'), PersonD.idOne);
});

/* assignment& PROFILE_FILTER */
test('pf property should return all associated pf. also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: [assignmentJoinFilterD.idOne]});
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  });
  let pf = assignment.get('pf');
  assert.equal(pf.get('length'), 1);
  assert.deepEqual(assignment.get('pf_ids'), [AssignmentFilterD.idOne]);
  assert.deepEqual(assignment.get('assignment_pf_ids'), [assignmentJoinFilterD.idOne]);
  assert.equal(pf.objectAt(0).get('id'), AssignmentFilterD.idOne);
});

test('pf property is not dirty when no pf present (undefined)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: undefined});
    store.push('assignmentfilter', {id: AssignmentFilterD.id});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('pf property is not dirty when no pf present (empty array)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: []});
    store.push('assignmentfilter', {id: AssignmentFilterD.id});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('remove_pf - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: [assignmentJoinFilterD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.remove_pf(AssignmentFilterD.idOne);
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal(assignment.get('assignment_pf_ids').length, 0);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

test('add_pf - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: [assignmentJoinFilterD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [AssignmentFilterD.idOne]);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.add_pf({id: AssignmentFilterD.idTwo});
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.equal(assignment.get('assignment_pf_ids').length, 2);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [AssignmentFilterD.idOne, AssignmentFilterD.idTwo]);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), AssignmentFilterD.idOne);
  assert.equal(assignment.get('pf').objectAt(1).get('id'), AssignmentFilterD.idTwo);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

test('savePf - pf - will reset the previous pf with multiple assignments', (assert) => {
  let assignmentfilter_unused = {id: AssignmentFilterD.unusedId};
  run(() => {
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
    store.push('assignmentfilter', {id: AssignmentFilterD.idTwo});
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idTwo, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idTwo});
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: [assignmentJoinFilterD.idOne, assignmentJoinFilterD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 2);
  assignment.remove_pf(AssignmentFilterD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.savePf();
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.add_pf(assignmentfilter_unused);
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.savePf();
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPf - pf - multiple assignments with the same pf will rollbackPf correctly', (assert) => {
  let assignment_two;
  run(() => {
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idOne, assignment_pk: assignmentD.idOne, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignment-join-filter', {id: assignmentJoinFilterD.idTwo, assignment_pk: assignmentD.idTwo, assignmentfilter_pk: AssignmentFilterD.idOne});
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
    assignment = store.push('assignment', {id: assignmentD.idOne, assignment_pf_fks: [assignmentJoinFilterD.idOne]});
    assignment_two = store.push('assignment', {id: assignmentD.idTwo, assignment_pf_fks: [assignmentJoinFilterD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
  assignment_two.remove_pf(AssignmentFilterD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsDirty'));
  assert.ok(assignment_two.get('isDirtyOrRelatedDirty'));
  assignment_two.rollbackPf();
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
  assignment.remove_pf(AssignmentFilterD.idOne);
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
  assignment.rollbackPf();
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change assignee and pf', assert => {
  // assignee
  run(() => {
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  // pf
  assert.equal(assignment.get('pf').get('length'), 0);
  run(() => {
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  });
  assignment.add_pf({id: AssignmentFilterD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - assignee and pf', assert => {
  // assignee
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: PersonD.idOne});
    assignee = store.push('person', {id: PersonD.idOne, assignments: [assignmentD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(assignment.get('assignee').get('id'), inactive_assignee.get('id'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.rollback();
  assert.equal(assignment.get('assignee').get('id'), assignee.get('id'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  // pf
  assert.equal(assignment.get('pf').get('length'), 0);
  run(() => {
    store.push('assignmentfilter', {id: AssignmentFilterD.idOne});
  });
  assignment.add_pf({id: AssignmentFilterD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.rollback();
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('assignment validations', assert => {
  run(() => {
    assignment = store.push('assignment', {id: assignmentD.idOne, assignee_fk: PersonD.idOne});
  });
  const attrs = assignment.get('validations').get('attrs');
  assert.ok(attrs.get('description'));
  assert.equal(assignment.get('validations').get('_validators').description[0].get('_type'), 'presence');
  assert.equal(assignment.get('validations').get('_validators').description[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('description').get('messages'), ['errors.assignment.description']);
  assert.ok(attrs.get('assignee'));
  assert.deepEqual(attrs.get('assignee').get('messages'), ['errors.assignment.assignee']);
});
