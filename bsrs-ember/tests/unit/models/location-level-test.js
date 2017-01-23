import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var location_level;

moduleFor('model:location-level', 'Unit | Model | location-level', {
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
  },
  afterEach() {
    delete this.store;
  }
});

test('location level is dirty when model has been updated', function(assert) {
  run(() => {
    location_level = this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion});
  });
  assert.ok(location_level.get('isNotDirty'));
  location_level.set('name', LLD.nameCompany);
  assert.ok(location_level.get('isDirty'));
  location_level.set('name', LLD.nameRegion);
  assert.ok(location_level.get('isNotDirty'));
});

test('location level can have child location levels', function(assert) {
  let location_level_child, location_level_dept;
  let model = {id: LLD.idOne, name: LLD.nameRegion, children_fks: [LLD.idTwo]};
  run(() => {
    location_level = this.store.push('location-level', model);
    location_level_dept = this.store.push('location-level', {id: LLD.idThree, name: LLD.nameDepartment});
    location_level_child = this.store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
  });
  assert.equal(location_level.get('children').get('length'), 1);
  location_level.set_children([location_level_child, location_level_dept]);
  assert.equal(location_level.get('children').get('length'), 2);
  assert.ok(location_level.get('isDirtyOrRelatedDirty'));
});

test('location level will sort children so not dirty', function(assert) {
  let location_level_child, location_level_dept;
  run(() => {
    const model = {id: LLD.idOne, name: LLD.nameRegion, children_fks: [LLD.idTwo, LLD.idThree]};
    location_level = this.store.push('location-level', model);
    location_level_child = this.store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
    location_level_dept = this.store.push('location-level', {id: LLD.idThree, name: LLD.nameDepartment});
  });
  assert.equal(location_level.get('children').get('length'), 2);
  location_level.set_children([location_level_dept, location_level_child]);
  assert.equal(location_level.get('isDirtyOrRelatedDirty'), false);
});

test('location level can have parent location levels', function(assert) {
  let model = {id: LLD.idTwo, name: LLD.nameDepartment, parent_fks: [LLD.idOne]};
  run(() => {
    location_level = this.store.push('location-level', model);
    this.store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion});
    this.store.push('location-level', {id: LLD.idThree, name: LLD.nameStore});
  });
  assert.equal(location_level.get('parents').get('length'), 1);
  location_level.set('parent_fks', [LLD.idOne, LLD.idThree]);
  assert.equal(location_level.get('parents').get('length'), 2);
});

test('location level can roll back children', function(assert) {
  let location_level_child, location_level_dept;
  let model = {id: LLD.idOne, name: LLD.nameRegion, children_fks: [LLD.idTwo]};
  run(() => {
    location_level = this.store.push('location-level', model);
    location_level_child = this.store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
    location_level_dept = this.store.push('location-level', {id: LLD.idThree, name: LLD.nameDepartment});
  });
  assert.equal(location_level.get('children').get('length'), 1);
  location_level.set_children([location_level_child, location_level_dept]);
  assert.equal(location_level.get('children').get('length'), 2);
  assert.ok(location_level.get('isDirtyOrRelatedDirty'));
  run(() => {
    location_level.rollback();
  });
  assert.equal(location_level.get('children').get('length'), 1);
});
