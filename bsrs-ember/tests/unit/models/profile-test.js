import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PersonD from 'bsrs-ember/vendor/defaults/person';

var store, profile, person, run = Ember.run;

module('unit: profile test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(function() {
    profile = store.push('profile', {id: PD.idOne, assignee_fk: PersonD.idOne});
    person = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
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

test('serialize', assert => {
  profile = store.push('profile', {
    id: PD.idOne,
    description: PD.descOne,
  });
  let ret = profile.serialize();
  assert.equal(ret.id, PD.idOne);
  assert.equal(ret.description, PD.descOne);
  assert.equal(ret.assignee, PD.assigneeOne);
});

/* ASSIGNEE */
test('related person should return one person for a profile', (assert) => {
  let people = store.find('person');
  assert.equal(profile.get('assignee').get('id'), PersonD.idOne);
});

test('change_assignee will update the persons assignee and dirty the model', (assert) => {
  let assignee = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
});

test('save profile will set assignee_fk to current assignee id', (assert) => {
  let assignee = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
  profile.saveRelated();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!profile.get('assigneeIsDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idTwo);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
});

test('rollback profile will set assignee to current assignee_fk', (assert) => {
  let assignee = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
  profile.rollback();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!profile.get('assigneeIsDirty'));
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
});
