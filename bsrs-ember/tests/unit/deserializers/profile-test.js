import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import ProfileDeserializer from 'bsrs-ember/deserializers/profile';

var store, profile, run = Ember.run, deserializer;

module('unit: profile deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'model:profile-list', 'model:person', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = ProfileDeserializer.create({
      simpleStore: store
    });
    run(() => {
      profile = store.push('profile', {
        id: PD.idOne
      });
    });
  }
});

test('deserialize single', assert => {
  let json = PF.detail();
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  assert.equal(profile.get('id'), PD.idOne);
  assert.equal(profile.get('description'), PD.descOne);
  assert.equal(profile.get('assignee_fk'), PD.assigneeOne);
  assert.equal(profile.get('assignee').get('id'), PD.assigneeOne);
  assert.equal(profile.get('assignee').get('username'), PD.username);
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
