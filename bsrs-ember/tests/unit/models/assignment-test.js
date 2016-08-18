import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/assignment';
import AF from 'bsrs-ember/vendor/assignment_fixtures';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import LD from 'bsrs-ember/vendor/defaults/location';
import AJFD from 'bsrs-ember/vendor/defaults/assignment-join-pfilter';
import PJCD from 'bsrs-ember/vendor/defaults/pfilter-join-criteria';
import CD from 'bsrs-ember/vendor/defaults/criteria';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, assignment, pfilter, inactive_assignee, pf;

moduleFor('model:assignment', 'Unit | Model | assignment', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username', 'validator:has-many'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:assignment', 'model:assignment-join-pfilter', 'model:pfilter', 'model:criteria', 'model:pfilter-join-criteria', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
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
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
  });
  let ret = assignment.serialize();
  assert.equal(ret.id, AD.idOne);
  assert.equal(ret.description, AD.descOne);
  assert.equal(ret.assignee, AD.assigneeOne);
});

test('add pfilter w/ id only and assignment is still clean', assert => {
  run(() => {
    store.push('pfilter', {id: PFD.idOne});
  });
  assignment.add_pf({id: PFD.idOne});
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

/* Assignee */
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

/* ASSIGNMENT & PROFILE_FILTER: Start */
test('pfilter property should return all associated pf. also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
    store.push('pfilter', {id: PFD.idOne});
  });
  let pf = assignment.get('pf');
  assert.equal(pf.get('length'), 1);
  assert.deepEqual(assignment.get('pf_ids'), [PFD.idOne]);
  assert.deepEqual(assignment.get('assignment_pf_ids'), [AJFD.idOne]);
  assert.equal(pf.objectAt(0).get('id'), PFD.idOne);
});

test('pfilter property is not dirty when no pf present (undefined)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: undefined});
    store.push('pfilter', {id: PFD.idOne});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('pfilter property is not dirty when no pf present (empty array)', (assert) => {
  run(() => {
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: []});
    store.push('pfilter', {id: PFD.idOne});
  });
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('pfIsNotDirty'));
});

test('remove_pf - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.remove_pf(PFD.idOne);
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.equal(assignment.get('assignment_pf_ids').length, 0);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

test('add_pf - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment.get('assignment_pf_ids').length, 1);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [PFD.idOne]);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.add_pf({id: PFD.idTwo});
  assert.equal(assignment.get('pf').get('length'), 2);
  assert.equal(assignment.get('assignment_pf_ids').length, 2);
  assert.equal(assignment.get('assignment_pf_fks').length, 1);
  assert.deepEqual(assignment.get('pf_ids'), [PFD.idOne, PFD.idTwo]);
  assert.equal(assignment.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(assignment.get('pf').objectAt(1).get('id'), PFD.idTwo);
  // adding to 'pf' array on 'assignment' doesn't make it dirty, only
  // if an attr on the 'pf' changes
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.set('key', PFD.keyOne);
  assert.ok(pfilter.get('isDirty'));
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
});

/* ASSIGNMENT & PROFILE_FILTER: End */

test('saveRelated - change assignee', assert => {
  // assignee
  run(() => {
    inactive_assignee = store.push('person', {id: PersonD.idTwo, assignments: []});
  });
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assignment.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('save - pfilter and their criteria not dirty when just add new filters but is dirty if add criteria (new location for example)', (assert) => {
  assert.equal(assignment.get('pf').get('length'), 0);
  assignment.add_pf({id: PFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  pf = assignment.get('pf').objectAt(0);
  assert.equal(pf.get('criteria').get('length'), 0);
  pf.add_criteria({id: LD.idOne});
  assert.equal(pf.get('criteria').get('length'), 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('savePf - and add back old pf with same id will keep criteria and wont be dirty', (assert) => {
  let pfilter_unused = {id: PFD.unusedId};
  run(() => {
    store.push('pfilter', {id: PFD.idOne});
    store.push('pfilter', {id: PFD.idTwo});
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('assignment-join-pfilter', {id: AJFD.idTwo, assignment_pk: AD.idOne, pfilter_pk: PFD.idTwo});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne, AJFD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 2);
  assignment.remove_pf(PFD.idOne);
  assert.equal(assignment.get('pf').get('length'), 1);
  pf = assignment.get('pf').objectAt(0);
  assert.equal(pf.get('criteria').get('length'), 0);
  // Only dirty until add criteria to pfilter
  pf.add_criteria({id: LD.idOne});
  assert.equal(pf.get('criteria').get('length'), 1);
  assert.ok(assignment.get('pfIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.saveRelated();
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.ok(assignment.get('isNotDirty'));
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(pf.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  // add back and should not be dirty and should have old criteria
  assignment.add_pf({id: PFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 2);
  const pf_two = assignment.get('pf').objectAt(1);
  assert.equal(pf_two.get('criteria').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - assignee and pf', assert => {
  // assignee
  let assignee;
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
  assignment.add_pf({id: PFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  pfilter = store.find('pfilter', PFD.idOne);
  pfilter.set('key', PFD.keyOne);
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.rollback();
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPf - multiple assignments with the same pf will rollbackPf correctly', (assert) => {
  let assignment_two;
  run(() => {
    store.push('assignment-join-pfilter', {id: AJFD.idOne, assignment_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('assignment-join-pfilter', {id: AJFD.idTwo, assignment_pk: AD.idTwo, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
    assignment = store.push('assignment', {id: AD.idOne, assignment_pf_fks: [AJFD.idOne]});
    assignment_two = store.push('assignment', {id: AD.idTwo, assignment_pf_fks: [AJFD.idTwo]});
  });
  assert.equal(assignment.get('pf').get('length'), 1);
  assert.equal(assignment_two.get('pf').get('length'), 1);
  assert.ok(assignment.get('pfIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(assignment_two.get('pfIsNotDirty'));
  assert.ok(assignment_two.get('isNotDirtyOrRelatedNotDirty'));
  assignment_two.remove_pf(PFD.idOne);
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
  assignment.remove_pf(PFD.idOne);
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

test('rollback - pf and their criteria', (assert) => {
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(assignment.get('pf').get('length'), 0);
  // add pfilter
  assignment.add_pf({id: PFD.idOne});
  assert.equal(assignment.get('pf').get('length'), 1);
  // add criteria
  pf = assignment.get('pf').objectAt(0);
  pf.add_criteria({id: LD.idOne});
  assert.ok(pf.get('isDirtyOrRelatedDirty'));
  assert.ok(pf.get('criteriaIsDirty'));
  assert.ok(assignment.get('isDirtyOrRelatedDirty'));
  assignment.rollback();
  assert.equal(assignment.get('pf').get('length'), 0);
  assert.ok(pf.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pf.get('criteriaIsNotDirty'));
  assert.ok(assignment.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(pf.get('criteria').get('length'), 0);
  assert.equal(store.find('criteria').get('length'), 1);
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
