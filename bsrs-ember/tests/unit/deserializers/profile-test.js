import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import PD from 'bsrs-ember/vendor/defaults/profile';
import PF from 'bsrs-ember/vendor/profile_fixtures';
import ProfileDeserializer from 'bsrs-ember/deserializers/profile';

var store, profile, run = Ember.run, deserializer;

module('unit: profile deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:profile', 'service:i18n']);
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

test('profile correctly deserialized profiles object', assert => {
  let json = PF.detail();
  run(() => {
    deserializer.deserialize(json, PD.idOne);
  });
  assert.equal(profile.get('id'), PD.idOne);
  assert.equal(profile.get('description'), PD.descOne);
  assert.equal(profile.get('order'), PD.orderOne);
  assert.equal(profile.get('assignee_id'), PD.assigneeOne);
});