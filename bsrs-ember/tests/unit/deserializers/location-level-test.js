import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';
import LLF from 'bsrs-ember/vendor/location-level_fixtures';
import LocationLevelDeserializer from 'bsrs-ember/deserializers/location-level';

var store, location_level, location_level_two, run = Ember.run, subject;

module('unit: location level deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:location-level', 'model:location-level-list']);
    subject = LocationLevelDeserializer.create({simpleStore: store});
  }
});

test('location level list model is correctly deserialized in its own store', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, children_fks: [LLD.idTwo] });
  let json = LLF.generate(LLD.idOne);
  let response = {'count':1,'next':null,'previous':null,'results': [json]};
  run(() => {
    subject.deserialize(response);
  });
  const location_levelz = store.find('location-level-list');
  assert.equal(location_levelz.get('length'), 1);
});

/* Children */
test('location level correctly deserialized if has children and new one comes in the store w/ children already present (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, children_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDepartment });
  let json = LLF.generate(LLD.idOne);
  json.children = [LLD.idTwo];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('children').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('children_fks').length, 1);
  assert.equal(location_level_two.get('children.length'), 0);
  assert.ok(!location_level_two.get('children_fks'));
});

test('location level correctly deserialized if has no children and new one comes in the store w/ children (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  let json = LLF.generate(LLD.idOne);
  json.children = [LLD.idTwo];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('children').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('children_fks').length, 1);
  assert.equal(location_level_two.get('children.length'), 0);
  assert.ok(!location_level_two.get('children_fks'));
});

test('location level correctly deserialized if has no children and new one comes in the store w/ no children (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameCompany });
  let json = LLF.generate(LLD.idOne);
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('children.length'), 0);
  assert.equal(location_level_two.get('children.length'), 0);
});

test('location level correctly deserialized if has no children and store location level already has children (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, children_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  let json = LLF.generate(LLD.idOne);
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('children.length'), 0);
  assert.deepEqual(location_level.get('children_fks'), []);
  assert.equal(location_level_two.get('children.length'), 0);
  assert.ok(!location_level_two.get('children_fks'));
});

test('location level updates children_fks array when new location level is pushed into store', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, children_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  store.push('location-level', {id: LLD.unusedId, name: LLD.nameRegion});
  let json = LLF.generate(LLD.idOne);
  assert.equal(location_level.get('children.length'), 1);
  json.children = [LLD.idTwo, LLD.unusedId];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('children').get('length'), 2);
  assert.equal(location_level.get('children').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('children').objectAt(1).get('id'), LLD.unusedId);
  assert.equal(location_level_two.get('children.length'), 0);
});

/* Parent */
test('location level correctly deserialized if has parents and new one comes in the store w/ parents already present (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, parent_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDepartment });
  let json = LLF.generate(LLD.idOne);
  json.parents = [LLD.idTwo];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('parents').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('parent_fks').length, 1);
  assert.equal(location_level_two.get('parents.length'), 0);
});

test('location level correctly deserialized if has no parents and new one comes in the store w/ parents (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  let json = LLF.generate(LLD.idOne);
  json.parents = [LLD.idTwo];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('parents').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('parent_fks').length, 1);
  assert.equal(location_level_two.get('parents.length'), 0);
});

test('location level correctly deserialized if has no parents and new one comes in the store w/ no parents (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameCompany });
  let json = LLF.generate(LLD.idOne);
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('parents.length'), 0);
  assert.equal(location_level_two.get('parents.length'), 0);
});

test('location level correctly deserialized if has no parents and store location level already has parents (detail)', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, parent_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  let json = LLF.generate(LLD.idOne);
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('parents.length'), 0);
  assert.deepEqual(location_level.get('parent_fks'), []);
  assert.equal(location_level_two.get('parents.length'), 0);
});

test('location level updates parent_fks array when new location level is pushed into store', (assert) => {
  location_level = store.push('location-level', { id: LLD.idOne, name: LLD.nameCompany, parent_fks: [LLD.idTwo] });
  location_level_two = store.push('location-level', { id: LLD.idTwo, name: LLD.nameDistrict });
  store.push('location-level', {id: LLD.unusedId, name: LLD.nameRegion});
  let json = LLF.generate(LLD.idOne);
  assert.equal(location_level.get('parents.length'), 1);
  json.parents = [LLD.idTwo, LLD.unusedId];
  run(() => {
    subject.deserialize(json, LLD.idOne);
  });
  assert.equal(location_level.get('parents').get('length'), 2);
  assert.equal(location_level.get('parents').objectAt(0).get('id'), LLD.idTwo);
  assert.equal(location_level.get('parents').objectAt(1).get('id'), LLD.unusedId);
  assert.equal(location_level_two.get('parents.length'), 0);
});
