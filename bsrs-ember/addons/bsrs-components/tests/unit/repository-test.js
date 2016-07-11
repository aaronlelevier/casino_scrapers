import Ember from 'ember';
const { run } = Ember;
import {test, module} from '../helpers/qunit';
import module_registry from '../helpers/module_registry';
import Deserializer from 'dummy/repository/deserializer';

var store, deserializer;

module('unit: repository test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:user', 'model:hat', 'model:user-hat-list', 'model:email', 'model:shoe', 'model:user-shoe']);
    deserializer = Deserializer.create({simpleStore: store});
    run(() => {
      store.push('hat', {id: 2});
    });
  }
});

test('repository sets up hat relationship in deserializer', (assert) => {
  const json = {id: 1, detail: true, hat_fk: 2};
  run(() => {
    deserializer.deserialize(json);
  });
  const hat = store.find('hat', 2);
  assert.deepEqual(hat.get('users'), [1]);
});

test('extract contacts works as expected', (assert) => {
  const json = {id: 1, emails: [{id: 2}]};
  run(() => {
    deserializer.deserialize_three(json);
  });
  const user = store.find('user', 1);
  assert.equal(user.get('email_fks'), 2);
  assert.ok(!user.get('emails'));
  const email = store.find('email', 2);
  assert.equal(email.get('id'), 2);
  assert.deepEqual(email.get('model_fk'), 1);
});

test('shoes relationship setup in deserializer', (assert) => {
  const json = {id: 1, shoes: [{id: 2}]};
  run(() => {
    deserializer.deserialize_four(json);
  });
  const user = store.find('user', 1);
  assert.deepEqual(user.get('user_shoes_fks').length, 1);
  assert.equal(user.get('shoes').get('length'), 1);
  assert.equal(user.get('shoes').objectAt(0).get('id'), 2);
  assert.deepEqual(user.get('user_shoes_ids').length, 1);
  assert.deepEqual(user.get('user_shoes').objectAt(0).get('user_pk'), 1);
  assert.deepEqual(user.get('user_shoes').objectAt(0).get('shoe_pk'), 2);
  const m2m_models = store.find('user-shoe');
  assert.equal(m2m_models.objectAt(0).get('shoe_pk'), 2);
  assert.equal(m2m_models.objectAt(0).get('user_pk'), 1);
});
