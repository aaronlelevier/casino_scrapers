import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import PPFD from 'bsrs-ember/vendor/defaults/profile-profile-filter';

var store, profile, person, run = Ember.run;

module('unit: profile test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:profile-join-pfilter', 'model:pfilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
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

// /* PROFILE & PROFILE_FILTER */
test('profile_filters property should return all associated profile_filters or empty array', (assert) => {
  let m2m = store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  let profile_filter = store.push('pfilter', {id: PFD.idOne});
  let pfs = profile.get('pfs');
  assert.equal(pfs.get('length'), 1);
  assert.equal(pfs.objectAt(0).get('id'), PFD.idOne);
  run(function() {
    store.push('profile-join-pfilter', {id: m2m.get('id'), removed: true});
  });
  assert.equal(profile.get('pfs').get('length'), 0);
});

test('pfs property is not dirty when no pfs present (undefined)', (assert) => {
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: undefined});
  store.push('pfilter', {id: PFD.id});
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.ok(profile.get('pfsIsNotDirty'));
});

test('pfs property is not dirty when no pfs present (empty array)', (assert) => {
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: []});
  store.push('pfilter', {id: PFD.id});
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.ok(profile.get('pfsIsNotDirty'));
});

test('pfs property is not dirty when attr on profile is changed', (assert) => {
  let m2m = store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  let pfilter = store.push('pfilter', {id: PFD.idOne});
  assert.ok(pfilter.get('isNotDirty'));
  assert.ok(pfilter.get('isNotDirtyOrRelatedNotDirty'));
  let pfs = profile.get('pfs');
  assert.equal(pfs.get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  run(function() {
    store.push('pfilter', {id: PFD.idOne, field: PFD.fieldOne});
  });
  assert.ok(pfilter.get('isDirty'));
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile.get('pfs').objectAt(0).get('field'), PFD.fieldOne);
});

test('removing a profile-join-pfilter will mark the profile as dirty and reduce the associated pfs models to zero', (assert) => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  let pfilter = store.push('pfilter', {id: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  profile.remove_pf(PFD.idOne);
  assert.ok(profile.get('pfsIsDirty'));
  assert.equal(profile.get('pfs').get('length'), 0);
});

test('replacing a profile-join-pfilter with some other profile-join-pfilter still shows the profile model as dirty', (assert) => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  store.push('pfilter', {id: PFD.idOne});
  const pfilter_two = {id: PFD.idTwo};
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.remove_pf(PFD.idOne);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.equal(profile.get('pfs').get('length'), 0);
  profile.add_pf(pfilter_two);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile.get('pfs').objectAt(0).get('id'), PFD.idTwo);
});
