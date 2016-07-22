import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import ProfileDeserializer from 'bsrs-ember/deserializers/profile';
import PFD from 'bsrs-ember/vendor/defaults/profile-filter';
import PPFD from 'bsrs-ember/vendor/defaults/profile-profile-filter';
import TD from 'bsrs-ember/vendor/defaults/ticket';

var store, profile, run = Ember.run, deserializer;

module('unit: profile deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:pfilter', 'model:profile-join-pfilter', 'model:profile-list', 'model:person', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = ProfileDeserializer.create({
      simpleStore: store
    });
  }
});

test('deserialize single - existing filters', assert => {
  let json = PF.detail();
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  profile = store.find('profile', PD.idOne);
  assert.equal(profile.get('id'), PD.idOne);
  assert.equal(profile.get('description'), PD.descOne);
  assert.equal(profile.get('assignee_fk'), PD.assigneeOne);
  assert.equal(profile.get('assignee').get('id'), PD.assigneeOne);
  assert.equal(profile.get('assignee').get('username'), PD.username);
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.equal(profile.get('pfs').objectAt(0).get('id'), PFD.idOne);
  assert.equal(profile.get('pfs').objectAt(0).get('context'), PFD.contextOne);
  assert.equal(profile.get('pfs').objectAt(0).get('field'), PFD.fieldOne);
  assert.deepEqual(profile.get('pfs').objectAt(0).get('criteria_fks'), [TD.priorityOneId]);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize single - no filters', assert => {
  let json = PF.detail();
  json.filters = [];
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  profile = store.find('profile', PD.idOne);
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing profile w/ filters, and server returns no filters - want no filters b/c that is the most recent', assert => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  profile = store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  let pfs = profile.get('pfs');
  assert.equal(pfs.get('length'), 1);
  let json = PF.detail();
  json.filters = [];
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  profile = store.find('profile', PD.idOne);
  assert.equal(profile.get('pfs').get('length'), 0);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing profile w/ filters, and server returns w/ 1 extra filter', assert => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  let json = PF.detail();
  json.filters.push({id: PFD.unusedId});
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  profile = store.find('profile', PD.idOne);
  assert.equal(profile.get('pfs').get('length'), 2);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing profile w/ filter and get same filter', assert => {
  store.push('profile-join-pfilter', {id: PPFD.idOne, profile_pk: PD.idOne, pfilter_pk: PFD.idOne});
  store.push('profile', {id: PD.idOne, profile_pfs_fks: [PPFD.idOne]});
  store.push('pfilter', {id: PFD.idOne});
  json = PF.detail();
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  profile = store.find('profile', PD.idOne);
  assert.equal(profile.get('pfs').get('length'), 1);
  assert.ok(profile.get('isNotDirty'));
  assert.ok(profile.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = PF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('profile-list').get('length'), 20);
  const i = 0;
  profile = store.find('profile-list').objectAt(i);
  assert.equal(profile.get('id'), `${PD.idOne.slice(0,-1)}${i}`);
  assert.equal(profile.get('description'), `${PD.descOne}${i}`);
  assert.equal(profile.get('assignee').id, `${PD.assigneeOne.slice(0,-1)}${i}`);
  assert.equal(profile.get('assignee').username, `${PD.username}${i}`);
});
