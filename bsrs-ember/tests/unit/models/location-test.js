import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store;

module('unit: location test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
    }
});

test('related location-level should return first location-level or undefined', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.idOne]});
    var location_level = location.get('location_level');
    assert.equal(location_level.get('name'), LLD.nameCompany);
    location_level.set('locations', [LD.unused]);
    assert.equal(location.get('location_level'), undefined);
});

test('related location-level is not dirty when no location-level present', (assert) => {
    store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
    var location = store.push('location', {id: LD.idOne});
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location-level'), undefined);
});

test('related location-level is not dirty with original location-level model and changing location level will not affect location isDirty', (assert) => {
    var location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
    var location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idOne});
    assert.ok(location.get('locationLevelIsNotDirty'));
    location_level.set('name', LLD.nameDepartment);
    assert.ok(location_level.get('isDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location_level.name'), LLD.nameDepartment);
});

test('related location-level only returns the single matching item even when multiple location-levels exist', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    store.push('location-level', {id: LLD.idOne, locations: [LD.idOne, LD.unusedId]});
    store.push('location-level', {id: LLD.idTwo, locations: ['123-abc-defg']});
    var location_level = location.get('location_level');
    assert.equal(location_level.get('id'), LLD.idOne);
});

test('related location-level will update when the location-levels locations array suddenly has the location pk', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId]});
    assert.equal(location.get('location_level'), undefined);
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('location_level'));
    assert.equal(location.get('location_level.id'), LLD.idOne);
});

test('related location-level will update when the location-levels locations array suddenly removes the location', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, locations: [LD.unusedId, LD.idOne]});
    assert.ok(location.get('location_level'));
    assert.equal(location.get('location_level.id'), LLD.idOne);
    location.change_location_level();
    assert.equal(location.get('location_level'), undefined);
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting undefined)', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: undefined});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting empty array)', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: []});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly assigned it shows as a not dirty relationship (starting with legit value)', (assert) => {
    var location = store.push('location', {id: LD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: [LD.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.change_location_level(location_level.get('id'));
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('when location has location-level suddenly removed it shows as a dirty relationship', (assert) => {
    var location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idOne});
    var location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameDistrict, locations: [LD.unusedId, LD.idOne]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    location.change_location_level();
    location_level.save();
    assert.equal(location.get('location_level'), undefined);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from valid location-level to nothing', (assert) => {
    var location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idTwo});
    var guest_location_level = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, locations: [LD.unusedId, LD.idOne]});
    var admin_location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level.name'), LLD.nameDistrict);
    location.change_location_level(admin_location_level.get('id'));
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.save();
    location.saveRelated();
    //location's location level set to none
    location.change_location_level();
    admin_location_level.save();
    assert.equal(location.get('location_level'), undefined);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackLocationLevel();
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from one location-level to another', (assert) => {
    var location = store.push('location', {id: LD.idOne, location_level_fk: LLD.idTwo});
    var guest_location_level = store.push('location-level', {id: LLD.idTwo, name: LLD.nameDistrict, locations: [LD.unusedId, LD.idOne]});
    var admin_location_level = store.push('location-level', {id: LLD.idOne, name: LLD.nameCompany, locations: [LD.unusedId]});
    var another_location_level = store.push('location-level', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e12c4', name: 'another', locations: [LD.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level.name'), LLD.nameDistrict);
    location.change_location_level(admin_location_level.get('id'));
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.save();
    location.saveRelated();
    location.change_location_level(another_location_level.get('id'));
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LD.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LD.unusedId, LD.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
    location.change_location_level(another_location_level.get('id'));
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LLD.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LD.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LD.unusedId, LD.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
});
