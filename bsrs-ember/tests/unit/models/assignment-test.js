import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import AFD from 'bsrs-ember/vendor/defaults/assignmentfilter';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-filter';

var store, assignment, inactive_assignee;

moduleFor('model:assignment', 'Unit | Model | assignment', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-join-filter', 'model:assignmentfilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      assignment = store.push('assignment', {id: AD.idOne});
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
    assignment = store.push('assignment', {id: AD.idOne, description: AD.descOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [AD.idOne]});
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    store.push('assignmentfilter', {id: AFD.idOne});
  });
  let ret = assignment.serialize();
  assert.equal(ret.id, AD.idOne);
  assert.equal(ret.description, AD.descOne);
  assert.equal(ret.assignee, AD.assigneeOne);
});

test('default pfilterContext', assert => {
  ret = assignment.get('defaultPfilter');
  assert.equal(ret.key, 'admin.placeholder.ticket_priority');
  assert.equal(ret.context, 'ticket.ticket');
  assert.equal(ret.field, 'priority');
});

test('availablePfilters - will be used in the assignment filter power select', assert => {
  ret = assignment.get('availablePfilters');
  assert.equal(ret.length, 2);
});

/* assignee */
test('related person should return one person for a assignment', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [AD.idOne]});
  });
  assert.equal(assignment.get('assignee').get('id'), PersonD.idOne);
});

test('change_assignee - will update the persons assignee and dirty the model', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: undefined});
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
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [AD.idOne]});
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
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, assignments: [AD.idOne]});
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

/* ASSIGNMENT & PROFILE_FILTER */
test('pf property should return all associated pf. also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('assignmentfilter', {id: AFD.idOne});
  });
  let pf = assignment.get('pf');
  assert.equal(pf.get('length'), 1);
  assert.deepEqual(assignment.get('pf_ids'), [AFD.idOne]);
  assert.deepEqual(assignment.get('assignment_pf_ids'), [AJFD.idOne]);
  assert.equal(pf.objectAt(0).get('id'), AFD.idOne);
});

test('pf property is not dirty when no pf present (undefined)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: undefined});
    store.push('assignmentfilter', {id: AFD.id});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('pf property is not dirty when no pf present (empty array)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: []});
    store.push('assignmentfilter', {id: AFD.id});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('remove_pf - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    store.push('assignmentfilter', {id: AFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.remove_pf(AFD.idOne);
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal(assignment.get('assignment_pf_ids').length, 0);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

test('add_pf - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    store.push('assignmentfilter', {id: AFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [AFD.idOne]);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.add_pf({id: AFD.idTwo});
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.equal(assignment.get('assignment_pf_ids').length, 2);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [AFD.idOne, AFD.idTwo]);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), AFD.idOne);
  assert.equal(assignment.get('pf').objectAt(1).get('id'), AFD.idTwo);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

test('savePf - pf - will reset the previous pf with multiple assignments', (assert) => {
  let assignmentfilter_unused = {id: AFD.unusedId};
  run(() => {
    store.push('assignmentfilter', {id: AFD.idOne});
    store.push('assignmentfilter', {id: AFD.idTwo});
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    store.push('assignment-join-filter', {id: AJFD.idTwo, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idTwo});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne, AJFD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 2);
  assignment.remove_pf(AFD.idOne);
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
    store.push('assignment-join-filter', {id: AJFD.idOne, assignment_pk: AD.idOne, assignmentfilter_pk: AFD.idOne});
    store.push('assignment-join-filter', {id: AJFD.idTwo, assignment_pk: AD.idTwo, assignmentfilter_pk: AFD.idOne});
    store.push('assignmentfilter', {id: AFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
    assignment_two = store.push('assignment', {id: AD.idTwo, assignment_pf_fks: [AJFD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
  assignment_two.remove_pf(AFD.idOne);
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
  assignment.remove_pf(AFD.idOne);
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
    store.push('assignmentfilter', {id: AFD.idOne});
  });
  assignment.add_pf({id: AFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - assignee and pf', assert => {
  // assignee
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: PersonD.idOne});
    assignee = store.push('person', {id: PersonD.idOne, assignments: [AD.idOne]});
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
    store.push('assignmentfilter', {id: AFD.idOne});
  });
  assignment.add_pf({id: AFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.rollback();
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('assignment validations', assert => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignee_fk: PersonD.idOne});
  });
  const attrs = assignment.get('validations').get('attrs');
  assert.ok(attrs.get('description'));
  assert.equal(assignment.get('validations').get('_validators').description[0].get('_type'), 'presence');
  assert.equal(assignment.get('validations').get('_validators').description[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('description').get('messages'), ['errors.assignment.description']);
  assert.ok(attrs.get('assignee'));
  assert.deepEqual(attrs.get('assignee').get('messages'), ['errors.assignment.assignee']);
});
