import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import AD from 'bsrs-ember/vendor/defaults/automation';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/pfilter';
import LD from 'bsrs-ember/vendor/defaults/location';
import AJFD from 'bsrs-ember/vendor/defaults/automation-join-pfilter';

var store, automation, pfilter, inactive_assignee, pf;

moduleFor('model:automation', 'Unit | Model | automation', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username', 'validator:has-many'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:automation', 'model:automation-join-pfilter', 'model:pfilter', 'model:criteria', 'model:pfilter-join-criteria', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      automation = store.push('automation', {id: AD.idOne});
    });
  }
});

test('dirty test | description', assert => {
  assert.equal(automation.get('isDirty'), false);
  automation.set('description', 'wat');
  assert.equal(automation.get('isDirty'), true);
  automation.set('description', '');
  assert.equal(automation.get('isDirty'), false);
});

test('serialize', assert => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, description: AD.descriptionOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, automations: [AD.idOne]});
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
  });
  let ret = automation.serialize();
  assert.equal(ret.id, AD.idOne);
  assert.equal(ret.description, AD.descriptionOne);
  assert.equal(ret.assignee, AD.assigneeOne);
});

test('add pfilter w/ id only and automation is still clean', assert => {
  run(() => {
    store.push('pfilter', {id: PFD.idOne});
  });
  automation.add_pf({id: PFD.idOne});
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

/* Assignee */
test('related person should return one person for a automation', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, automations: [AD.idOne]});
  });
  assert.equal(automation.get('assignee').get('id'), PersonD.idOne);
});

test('change_assignee - will update the persons assignee and dirty the model', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: undefined});
    store.push('person', {id: PersonD.idOne, automations: []});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, automations: []});
  });
  assert.equal(automation.get('assignee'), undefined);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation.get('assigneeIsNotDirty'));
  automation.change_assignee({id: PersonD.idOne});
  assert.equal(automation.get('assignee_fk'), undefined);
  assert.equal(automation.get('assignee.id'), PersonD.idOne);
  automation.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.ok(automation.get('assigneeIsDirty'));
  assert.equal(automation.get('assignee_fk'), undefined);
  assert.equal(automation.get('assignee.id'), PersonD.idTwo);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.ok(automation.get('assigneeIsDirty'));
});

test('saveAssignee - assignee - automationwill set assignee_fk to current assignee id', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, automations: [AD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, automations: []});
  });
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('assignee_fk'), PersonD.idOne);
  assert.equal(automation.get('assignee.id'), PersonD.idOne);
  automation.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(automation.get('assignee_fk'), PersonD.idOne);
  assert.equal(automation.get('assignee.id'), PersonD.idTwo);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.ok(automation.get('assigneeIsDirty'));
  automation.saveAssignee();
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!automation.get('assigneeIsDirty'));
  assert.equal(automation.get('assignee_fk'), PersonD.idTwo);
  assert.equal(automation.get('assignee.id'), PersonD.idTwo);
});

test('rollbackAssignee - assignee - automationwill set assignee to current assignee_fk', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: PersonD.idOne});
    store.push('person', {id: PersonD.idOne, automations: [AD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, automations: []});
  });
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('assignee_fk'), PersonD.idOne);
  assert.equal(automation.get('assignee.id'), PersonD.idOne);
  automation.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(automation.get('assignee_fk'), PersonD.idOne);
  assert.equal(automation.get('assignee.id'), PersonD.idTwo);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.ok(automation.get('assigneeIsDirty'));
  automation.rollbackAssignee();
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!automation.get('assigneeIsDirty'));
  assert.equal(automation.get('assignee.id'), PersonD.idOne);
  assert.equal(automation.get('assignee_fk'), PersonD.idOne);
});

/* automation & PROFILE_FILTER: Start */
test('pfilter property should return all associated pf. also confirm related and join model attr values', (assert) => {
  run(() => {
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
    store.push('pfilter', {id: PFD.idOne});
  });
  let pf = automation.get('pf');
  assert.equal(pf.get('length'), 1);
  assert.deepEqual(automation.get('pf_ids'), [PFD.idOne]);
  assert.deepEqual(automation.get('automation_pf_ids'), [AJFD.idOne]);
  assert.equal(pf.objectAt(0).get('id'), PFD.idOne);
});

test('pfilter property is not dirty when no pf present (undefined)', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: undefined});
    store.push('pfilter', {id: PFD.idOne});
  });
  assert.equal(automation.get('pf').get('length'), 0);
  assert.ok(automation.get('pfIsNotDirty'));
});

test('pfilter property is not dirty when no pf present (empty array)', (assert) => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: []});
    store.push('pfilter', {id: PFD.idOne});
  });
  assert.equal(automation.get('pf').get('length'), 0);
  assert.ok(automation.get('pfIsNotDirty'));
});

test('remove_pf - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
  });
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('automation_pf_ids').length, 1);
  assert.equal(automation.get('automation_pf_fks').length, 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  automation.remove_pf(PFD.idOne);
  assert.equal(automation.get('pf').get('length'), 0);
  assert.equal(automation.get('automation_pf_ids').length, 0);
  assert.equal(automation.get('automation_pf_fks').length, 1);
  assert.ok(automation.get('pfIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
});

test('add_pf - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    pfilter = store.push('pfilter', {id: PFD.idOne});
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
  });
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation.get('automation_pf_ids').length, 1);
  assert.equal(automation.get('automation_pf_fks').length, 1);
  assert.deepEqual(automation.get('pf_ids'), [PFD.idOne]);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  automation.add_pf({id: PFD.idTwo});
  assert.equal(automation.get('pf').get('length'), 2);
  assert.equal(automation.get('automation_pf_ids').length, 2);
  assert.equal(automation.get('automation_pf_fks').length, 1);
  assert.deepEqual(automation.get('pf_ids'), [PFD.idOne, PFD.idTwo]);
  assert.equal(automation.get('pf').objectAt(0).get('id'), PFD.idOne);
  assert.equal(automation.get('pf').objectAt(1).get('id'), PFD.idTwo);
  // adding to 'pf' array on 'automation' doesn't make it dirty, only
  // if an attr on the 'pf' changes
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  pfilter.set('source_id', PFD.sourceIdOne);
  assert.ok(pfilter.get('isDirty'));
  assert.ok(automation.get('pfIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
});

/* automation & PROFILE_FILTER: End */

test('saveRelated - change assignee', assert => {
  // assignee
  run(() => {
    inactive_assignee = store.push('person', {id: PersonD.idTwo, automations: []});
  });
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  automation.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.saveRelated();
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('save - pfilter and their criteria not dirty when just add new filters but is dirty if add criteria (new location for example)', (assert) => {
  assert.equal(automation.get('pf').get('length'), 0);
  automation.add_pf({id: PFD.idOne});
  assert.equal(automation.get('pf').get('length'), 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  pf = automation.get('pf').objectAt(0);
  assert.equal(pf.get('criteria').get('length'), 0);
  pf.add_criteria({id: LD.idOne});
  assert.equal(pf.get('criteria').get('length'), 1);
  assert.ok(automation.get('pfIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.saveRelated();
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('savePf - and add back old pf with same id will keep criteria and wont be dirty', (assert) => {
  run(() => {
    store.push('pfilter', {id: PFD.idOne});
    store.push('pfilter', {id: PFD.idTwo});
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('automation-join-pfilter', {id: AJFD.idTwo, automation_pk: AD.idOne, pfilter_pk: PFD.idTwo});
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne, AJFD.idTwo]});
  });
  assert.equal(automation.get('pf').get('length'), 2);
  automation.remove_pf(PFD.idOne);
  assert.equal(automation.get('pf').get('length'), 1);
  pf = automation.get('pf').objectAt(0);
  assert.equal(pf.get('criteria').get('length'), 0);
  // Only dirty until add criteria to pfilter
  pf.add_criteria({id: LD.idOne});
  assert.equal(pf.get('criteria').get('length'), 1);
  assert.ok(automation.get('pfIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.saveRelated();
  assert.equal(automation.get('pf').get('length'), 1);
  assert.ok(automation.get('isNotDirty'));
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(pf.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // add back and should not be dirty and should have old criteria
  automation.add_pf({id: PFD.idOne});
  assert.equal(automation.get('pf').get('length'), 2);
  const pf_two = automation.get('pf').objectAt(1);
  assert.equal(pf_two.get('criteria').get('length'), 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - assignee and pf', assert => {
  // assignee
  let assignee;
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: PersonD.idOne});
    assignee = store.push('person', {id: PersonD.idOne, automations: [AD.idOne]});
    inactive_assignee = store.push('person', {id: PersonD.idTwo, automations: []});
  });
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  automation.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(automation.get('assignee').get('id'), inactive_assignee.get('id'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.rollback();
  assert.equal(automation.get('assignee').get('id'), assignee.get('id'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  // pf
  assert.equal(automation.get('pf').get('length'), 0);
  automation.add_pf({id: PFD.idOne});
  assert.equal(automation.get('pf').get('length'), 1);
  pfilter = store.find('pfilter', PFD.idOne);
  pfilter.set('source_id', PFD.sourceIdOne);
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.rollback();
  assert.equal(automation.get('pf').get('length'), 0);
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPf - multiple automations with the same pf will rollbackPf correctly', (assert) => {
  let automation_two;
  run(() => {
    store.push('automation-join-pfilter', {id: AJFD.idOne, automation_pk: AD.idOne, pfilter_pk: PFD.idOne});
    store.push('automation-join-pfilter', {id: AJFD.idTwo, automation_pk: AD.idTwo, pfilter_pk: PFD.idOne});
    store.push('pfilter', {id: PFD.idOne});
    automation = store.push('automation', {id: AD.idOne, automation_pf_fks: [AJFD.idOne]});
    automation_two = store.push('automation', {id: AD.idTwo, automation_pf_fks: [AJFD.idTwo]});
  });
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation_two.get('pf').get('length'), 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation_two.get('pfIsNotDirty'));
  assert.ok(automation_two.get('isNotDirtyOrRelatedNotDirty'));
  automation_two.remove_pf(PFD.idOne);
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation_two.get('pf').get('length'), 0);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation_two.get('pfIsDirty'));
  assert.ok(automation_two.get('isDirtyOrRelatedDirty'));
  automation_two.rollbackPf();
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation_two.get('pf').get('length'), 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation_two.get('pfIsNotDirty'));
  assert.ok(automation_two.get('isNotDirtyOrRelatedNotDirty'));
  automation.remove_pf(PFD.idOne);
  assert.equal(automation.get('pf').get('length'), 0);
  assert.equal(automation_two.get('pf').get('length'), 1);
  assert.ok(automation.get('pfIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  assert.ok(automation_two.get('pfIsNotDirty'));
  assert.ok(automation_two.get('isNotDirtyOrRelatedNotDirty'));
  automation.rollbackPf();
  assert.equal(automation.get('pf').get('length'), 1);
  assert.equal(automation_two.get('pf').get('length'), 1);
  assert.ok(automation.get('pfIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(automation_two.get('pfIsNotDirty'));
  assert.ok(automation_two.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - pf and their criteria', (assert) => {
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(automation.get('pf').get('length'), 0);
  // add pfilter
  automation.add_pf({id: PFD.idOne});
  assert.equal(automation.get('pf').get('length'), 1);
  // add criteria
  pf = automation.get('pf').objectAt(0);
  pf.add_criteria({id: LD.idOne});
  assert.ok(pf.get('isDirtyOrRelatedDirty'));
  assert.ok(pf.get('criteriaIsDirty'));
  assert.ok(automation.get('isDirtyOrRelatedDirty'));
  automation.rollback();
  assert.equal(automation.get('pf').get('length'), 0);
  assert.ok(pf.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(pf.get('criteriaIsNotDirty'));
  assert.ok(automation.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(pf.get('criteria').get('length'), 0);
  assert.equal(store.find('criteria').get('length'), 1);
});

test('automation validations', assert => {
  run(() => {
    automation = store.push('automation', {id: AD.idOne, assignee_fk: PersonD.idOne});
  });
  const attrs = automation.get('validations').get('attrs');
  assert.ok(attrs.get('description'));
  assert.equal(automation.get('validations').get('_validators').description[0].get('_type'), 'presence');
  assert.equal(automation.get('validations').get('_validators').description[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('description').get('messages'), ['errors.automation.description']);
  assert.ok(attrs.get('assignee'));
  assert.deepEqual(attrs.get('assignee').get('messages'), ['errors.automation.assignee']);
});
