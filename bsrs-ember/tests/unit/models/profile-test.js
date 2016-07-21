import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PersonD from 'bsrs-ember/vendor/defaults/person';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import PPFD from 'bsrs-ember/vendor/defaults/profile-profile-filter';
import ProfileDeserializer from 'bsrs-ember/deserializers/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, profile, assignee;

module('unit: profile test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:profile-join-pfilter', 'model:pfilter', 'model:person', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = ProfileDeserializer.create({
      simpleStore: store
    });
    run(() => {
      profile = store.push('profile', {id: PD.idOne, assignee_fk: PersonD.idOne});
      assignee = store.push('person', {id: PersonD.idOne, profiles: [PD.idOne]});
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
  let json = PF.detail();
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  let ret = profile.serialize();
  assert.equal(ret.id, PD.idOne);
  assert.equal(ret.description, PD.descOne);
  assert.equal(ret.assignee, PD.assigneeOne);
  assert.equal(ret.filters.length, 1);
  assert.equal(ret.filters[0].id, PFD.idOne);
  assert.equal(ret.filters[0].context, PFD.contextOne);
  assert.equal(ret.filters[0].field, PFD.fieldOne);
  assert.deepEqual(ret.filters[0].criteria, [TD.priorityOneId]);
});

test('default pfilterContext', assert => {
  ret = profile.get('defaultPfilter');
  assert.equal(ret.key, 'admin.placeholder.ticket_priority');
  assert.equal(ret.context, 'ticket.ticket');
  assert.equal(ret.field, 'priority');
});

test('availablePfilters - will be used in the profile filter power select', assert => {
  ret = profile.get('availablePfilters');
  assert.equal(ret.length, 2);
});

/* ASSIGNEE */
test('related person should return one person for a profile', (assert) => {
  let people = store.find('person');
  assert.equal(profile.get('assignee').get('id'), PersonD.idOne);
});

test('change_assignee - will update the persons assignee and dirty the model', (assert) => {
  profile = store.push('profile', {id: PD.idOne, assignee_fk: undefined});
  assignee = store.push('person', {id: PersonD.idOne, profiles: []});
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.equal(profile.get('assignee'), undefined);
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(profile.get('assigneeIsNotDirty'));
  profile.change_assignee({id: PersonD.idOne});
  assert.equal(profile.get('assignee_fk'), undefined);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
  assert.equal(profile.get('assignee_fk'), undefined);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
});

test('saveAssignee - assignee - profile will set assignee_fk to current assignee id', (assert) => {
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
  profile.saveAssignee();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!profile.get('assigneeIsDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idTwo);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
});

test('rollbackAssignee - assignee - profile will set assignee to current assignee_fk', (assert) => {
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
  assert.equal(profile.get('assignee.id'), PersonD.idTwo);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile.get('assigneeIsDirty'));
  profile.rollbackAssignee();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!profile.get('assigneeIsDirty'));
  assert.equal(profile.get('assignee.id'), PersonD.idOne);
  assert.equal(profile.get('assignee_fk'), PersonD.idOne);
});

/* PROFILE & PROFILE_FILTER */
test('pfs property should return all associated pfs. also confirm related and join model attr values', (assert) => {
  let m2m = store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  let profile_filter = store.push('pfilter', {id: PFD.idOne});
  let pfs = profile.get('pfs');
  assert.equal(pfs.get('length'), 1);
  assert.deepEqual(profile.get('pfs_ids'), [PFD.idOne]);
  assert.deepEqual(profile.get('profile_pfs_ids'), [PPFD.idOne]);
  assert.equal(pfs.objectAt(0).get('id'), PFD.idOne);
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

test('remove_pf - will remove join model and mark model as dirty', (assert) => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  let pfilter = store.push('pfilter', {id: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile.get('profile_pfs_ids').length, 1);
  assert.equal(profile.get('profile_pfs_fks').length, 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.remove_pf(PFD.idOne);
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.equal(profile.get('profile_pfs_ids').length, 0);
  assert.equal(profile.get('profile_pfs_fks').length, 1);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
});

test('add_pf - will create join model and mark model dirty', (assert) => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  let pfilter = store.push('pfilter', {id: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile.get('profile_pfs_ids').length, 1);
  assert.equal(profile.get('profile_pfs_fks').length, 1);
  assert.deepEqual(profile.get('pfs_ids'), [PFD.idOne]);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.add_pf({id: PFD.idTwo});
  assert.equal(profile.get('pfs').get('length'), 2);
  assert.equal(profile.get('profile_pfs_ids').length, 2);
  assert.equal(profile.get('profile_pfs_fks').length, 1);
  assert.deepEqual(profile.get('pfs_ids'), [PFD.idOne, PFD.idTwo]);
  assert.equal(profile.get('pfs').objectAt(0).get('id'), PFD.idOne);
  assert.equal(profile.get('pfs').objectAt(1).get('id'), PFD.idTwo);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
});

test('savePfs - pfs - will reset the previous pfs with multiple profiles', (assert) => {
  store.push('pfilter', {id: PFD.idOne});
  store.push('pfilter', {id: PFD.idTwo});
  const pfilter_unused = {id: PFD.unusedId};
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  store.push('profile-join-pfilter', {id: PPFD.idTwo, profile_pk: PD.idOne, pfilter_pk: PFD.idTwo});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne, PPFD.idTwo]});
  assert.equal(profile.get('pfs').get('length'), 2);
  profile.remove_pf(PFD.idOne);
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.savePfs();
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.add_pf(pfilter_unused);
  assert.equal(profile.get('pfs').get('length'), 2);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.savePfs();
  assert.equal(profile.get('pfs').get('length'), 2);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackPfs - pfs - multiple profiles with the same pfs will rollbackPfs correctly', (assert) => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  store.push('profile-join-pfilter', {id: PPFD.idTwo, profile_pk: PD.idTwo, pfilter_pk: PFD.idOne});
  store.push('pfilter', {id: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  let profile_two = store.push('profile', {id: PD.idTwo, profile_pfs_fks: [PPFD.idTwo]});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile_two.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(profile_two.get('pfsIsNotDirty'));
  assert.ok(profile_two.get('isNotDirtyOrRelatedNotDirty'));
  profile_two.remove_pf(PFD.idOne);
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile_two.get('pfs').get('length'), 0);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(profile_two.get('pfsIsDirty'));
  assert.ok(profile_two.get('isDirtyOrRelatedDirty'));
  profile_two.rollbackPfs();
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile_two.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(profile_two.get('pfsIsNotDirty'));
  assert.ok(profile_two.get('isNotDirtyOrRelatedNotDirty'));
  profile.remove_pf(PFD.idOne);
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.equal(profile_two.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsDirty'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  assert.ok(profile_two.get('pfsIsNotDirty'));
  assert.ok(profile_two.get('isNotDirtyOrRelatedNotDirty'));
  profile.rollbackPfs();
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile_two.get('pfs').get('length'), 1);
  assert.ok(profile.get('pfsIsNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(profile_two.get('pfsIsNotDirty'));
  assert.ok(profile_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change assignee and pfs', assert => {
  // assignee
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.saveRelated();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  // pfs
  assert.equal(profile.get('pfs').get('length'), 0);
  store.push('pfilter', {id: PFD.idOne});
  profile.add_pf({id: PFD.idOne});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.saveRelated();
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - assignee and pfs', assert => {
  // assignee
  let inactive_assignee = store.push('person', {id: PersonD.idTwo, profiles: []});
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  profile.change_assignee({id: inactive_assignee.get('id')});
  assert.equal(profile.get('assignee').get('id'), inactive_assignee.get('id'));
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.rollback();
  assert.equal(profile.get('assignee').get('id'), assignee.get('id'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
  // pfs
  assert.equal(profile.get('pfs').get('length'), 0);
  store.push('pfilter', {id: PFD.idOne});
  profile.add_pf({id: PFD.idOne});
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('isDirtyOrRelatedDirty'));
  profile.rollback();
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});
