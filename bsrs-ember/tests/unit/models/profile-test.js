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
  profile = store.push('profile', {id: PD.idOne, profile_join_pfilters_fks: [PPFD.idOne]});
  let profile_filter = store.push('pfilter', {id: PFD.idOne});
  assert.equal(profile.get('pfs').get('length'), 1);
});

// test('cc property is not dirty when no cc present (undefined)', (assert) => {
//   ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: undefined});
//   store.push('person', {id: PD.id});
//   assert.equal(ticket.get('cc').get('length'), 0);
//   assert.ok(ticket.get('ccIsNotDirty'));
// });

// test('cc property is not dirty when no cc present (empty array)', (assert) => {
//   ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: []});
//   store.push('person', {id: PD.id});
//   assert.equal(ticket.get('cc').get('length'), 0);
//   assert.ok(ticket.get('ccIsNotDirty'));
// });

// test('cc property is not dirty when attr on person is changed', (assert) => {
//   store.push('ticket-person', {id: PPFD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
//   let person = store.push('person', {id: PD.id});
//   ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [PPFD.idOne]});
//   assert.equal(ticket.get('cc').get('length'), 1);
//   assert.ok(ticket.get('ccIsNotDirty'));
//   run(function() {
//     store.push('person', {id: PD.id, first_name: PD.first_name});
//   });
//   assert.ok(person.get('isDirty'));
//   assert.ok(ticket.get('ccIsNotDirty'));
//   assert.equal(ticket.get('cc').get('length'), 1);
//   assert.equal(ticket.get('cc').objectAt(0).get('first_name'), PD.first_name);
// });

// test('removing a ticket-person will mark the ticket as dirty and reduce the associated cc models to zero', (assert) => {
//   store.push('ticket-person', {id: PPFD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
//   let person = store.push('person', {id: PD.id});
//   ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [PPFD.idOne]});
//   assert.equal(ticket.get('cc').get('length'), 1);
//   assert.ok(ticket.get('ccIsNotDirty'));
//   ticket.remove_cc(PD.id);
//   assert.ok(ticket.get('ccIsDirty'));
//   assert.equal(ticket.get('cc').get('length'), 0);
// });

// test('replacing a ticket-person with some other ticket-person still shows the ticket model as dirty', (assert) => {
//   store.push('ticket-person', {id: PPFD.idOne, ticket_pk: TD.idOne, person_pk: PD.id});
//   store.push('person', {id: PD.id});
//   const person_two = {id: PD.idTwo};
//   ticket = store.push('ticket', {id: TD.idOne, ticket_cc_fks: [PPFD.idOne]});
//   assert.equal(ticket.get('cc').get('length'), 1);
//   assert.ok(ticket.get('ccIsNotDirty'));
//   assert.ok(ticket.get('isNotDirtyOrRelatedNotDirty'));
//   ticket.remove_cc(PD.id);
//   assert.ok(ticket.get('ccIsDirty'));
//   assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//   assert.equal(ticket.get('cc').get('length'), 0);
//   ticket.add_cc(person_two);
//   assert.ok(ticket.get('ccIsDirty'));
//   assert.ok(ticket.get('isDirtyOrRelatedDirty'));
//   assert.equal(ticket.get('cc').get('length'), 1);
//   assert.equal(ticket.get('cc').objectAt(0).get('id'), PD.idTwo);
// });
