import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, location_level, run = Ember.run;

module('unit: location level test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location-level']);
    }
});

test('location level is dirty when model has been updated', (assert) => {
    location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion});
    assert.ok(location_level.get('isNotDirty'));
    location_level.set('name', LLD.nameCompany);
    assert.ok(location_level.get('isDirty'));
    location_level.set('name', LLD.nameRegion);
    assert.ok(location_level.get('isNotDirty'));
});

test('location level can have child location levels', (assert) => {
    let location_level_dept;
    let model = {id: LLD.idOne, name: LLD.nameRegion, children_fks: [LLD.idTwo]};
    location_level = store.push('location-level', model);
    let location_level_child = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
    assert.equal(location_level.get('children').get('length'), 1);
    run(function() {
        location_level_dept = store.push('location-level', {id: LLD.idThree, name: LLD.nameDepartment});
    });
    location_level.set_children([location_level_child, location_level_dept]);
    assert.equal(location_level.get('children').get('length'), 2);
    assert.ok(location_level.get('isDirtyOrRelatedDirty'));
});

test('location level can have parent location levels', (assert) => {
    let model = {id: LLD.idTwo, name: LLD.nameDepartment, parent_fks: [LLD.idOne]};
    location_level = store.push('location-level', model);
    store.push('location-level', {id: LLD.idOne, name: LLD.nameRegion});
    assert.equal(location_level.get('parents').get('length'), 1);
    run(function() {
        store.push('location-level', {id: LLD.idThree, name: LLD.nameStore});
    });
    location_level.set('parent_fks', [LLD.idOne, LLD.idThree]);
    assert.equal(location_level.get('parents').get('length'), 2);
});

test('location level can roll back children', (assert) => {
    let location_level_dept;
    let model = {id: LLD.idOne, name: LLD.nameRegion, children_fks: [LLD.idTwo]};
    location_level = store.push('location-level', model);
    let location_level_child = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDepartment});
    assert.equal(location_level.get('children').get('length'), 1);
    run(function() {
        location_level_dept = store.push('location-level', {id: LLD.idThree, name: LLD.nameDepartment});
    });
    location_level.set_children([location_level_child, location_level_dept]);
    assert.equal(location_level.get('children').get('length'), 2);
    assert.ok(location_level.get('isDirtyOrRelatedDirty'));
    location_level.rollback();
    assert.equal(location_level.get('children').get('length'), 1);
});
