import Ember from 'ember';
const { run } = Ember;
import {test, module} from '../helpers/qunit';
import module_registry from '../helpers/module_registry';
import Deserializer from 'dummy/repository/deserializer';

var store, deserializer;

module('unit: repository test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:user', 'model:hat', 'model:shirt', 
      'model:user-hat-list', 'model:email', 'model:shoe', 'model:user-shoe', 'model:finger', 
      'model:user-finger']);
    deserializer = Deserializer.create({simpleStore: store});
    run(() => {
      store.push('hat', {id: 2});
    });
  }
});

test('repository sets up hat relationship in deserializer (bootstrapped)', function(assert) {
  const json = {id: 1, detail: true, hat_fk: 2};
  run(() => {
    deserializer.deserialize(json);
  });
  const hat = store.find('hat', 2);
  assert.deepEqual(hat.get('users'), [1]);
});

test('repository sets up shirt relationship in deserializer as object (non-bootstrapped)', function(assert) {
  const json = {id: 1, detail: true, shirt: {id: 2, name: 'who'} };
  run(() => {
    deserializer.deserialize_two(json);
  });
  const shirt = store.find('shirt', 2);
  assert.deepEqual(shirt.get('users'), [1]);
});

test('accepts null', function(assert) {
  const json = {id: 1, detail: true, hat_fk: null};
  run(() => {
    deserializer.deserialize(json);
  });
  const hat = store.find('hat', 2);
  assert.equal(hat.get('users'), undefined);
});

test('shoes relationship setup in deserializer', function(assert) {
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

test('fingers relationship setup in deserializer', function(assert) {
  const json = {id: 1, fingers: [{id: 2}]};
  run(() => {
    deserializer.deserialize_five(json);
  });
  const user = store.find('user', 1);
  assert.deepEqual(user.get('user_fingers_fks').length, 1);
  assert.equal(user.get('fingers').get('length'), 1);
  assert.equal(user.get('fingers').objectAt(0).get('id'), 2);
  assert.deepEqual(user.get('user_fingers_ids').length, 1);
  assert.deepEqual(user.get('user_fingers').objectAt(0).get('user_pk'), 1);
  assert.deepEqual(user.get('user_fingers').objectAt(0).get('finger_pk'), 2);
  const m2m_models = store.find('user-finger');
  assert.equal(m2m_models.objectAt(0).get('finger_pk'), 2);
  assert.equal(m2m_models.objectAt(0).get('user_pk'), 1);
});
