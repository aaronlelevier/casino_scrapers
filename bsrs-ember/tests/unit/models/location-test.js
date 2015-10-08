import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var store;

module('unit: location test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
    }
});

test('related location-level should return first location-level or undefined', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.idOne]});
    var location_level = location.get('location_level');
    assert.equal(location_level.get('name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    location_level.set('locations', [LOCATION_DEFAULTS.unused]);
    assert.equal(location.get('location_level'), undefined);
});

test('related location-level is not dirty when no location-level present', (assert) => {
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, locations: [LOCATION_DEFAULTS.unusedId]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location-level'), undefined);
});

test('related location-level is not dirty with original location-level model and changing location level will not affect location isDirty', (assert) => {
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, locations: [LOCATION_DEFAULTS.idOne]});
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    assert.ok(location.get('locationLevelIsNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameDepartment);
    assert.ok(location_level.get('isDirty'));
    assert.ok(location.get('locationLevelIsNotDirty'));
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDepartment);
});

test('related location-level only returns the single matching item even when multiple location-levels exist', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, locations: [LOCATION_DEFAULTS.idOne, LOCATION_DEFAULTS.unusedId]});
    store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, locations: ['123-abc-defg']});
    var location_level = location.get('location_level');
    assert.equal(location_level.get('id'), LOCATION_LEVEL_DEFAULTS.idOne);
});

test('related location-level will update when the location-levels locations array suddenly has the location pk', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, locations: [LOCATION_DEFAULTS.unusedId]});
    assert.equal(location.get('location_level'), undefined);
    location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.ok(location.get('location_level'));
    assert.equal(location.get('location_level.id'), LOCATION_LEVEL_DEFAULTS.idOne);
});

test('related location-level will update when the location-levels locations array suddenly removes the location', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, locations: [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]});
    assert.ok(location.get('location_level'));
    assert.equal(location.get('location_level.id'), LOCATION_LEVEL_DEFAULTS.idOne);
    location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    assert.equal(location.get('location_level'), undefined);
});

test('when location has location-level suddently assigned it shows as a not dirty relationship (starting undefined)', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: undefined});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('locations', [LOCATION_DEFAULTS.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location has location-level suddently assigned it shows as a not dirty relationship (starting empty array)', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: []});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('locations', [LOCATION_DEFAULTS.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location has location-level suddently assigned it shows as a not dirty relationship (starting with legit value)', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: [LOCATION_DEFAULTS.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('when location has location-level suddently removed it shows as a dirty relationship', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    location_level.save();
    assert.equal(location.get('location_level'), undefined);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from valid location-level to nothing', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idTwo});
    var guest_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]});
    var admin_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    guest_location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    guest_location_level.save();
    admin_location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.save();
    location.saveRelated();
    //location's location level set to none
    admin_location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    admin_location_level.save();
    assert.equal(location.get('location_level'), undefined);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackLocationLevel();
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback location-level will reset the previously used location-level when switching from one location-level to another', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idTwo});
    var guest_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDistrict, locations: [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]});
    var admin_location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [LOCATION_DEFAULTS.unusedId]});
    var another_location_level = store.push('location-level', {id: 'af34ee9b-833c-4f3e-a584-b6851d1e12c4', name: 'another', locations: [LOCATION_DEFAULTS.unusedId]});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameDistrict);
    guest_location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    guest_location_level.save();
    admin_location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.save();
    location.saveRelated();
    admin_location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    admin_location_level.save();
    another_location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LOCATION_DEFAULTS.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
    admin_location_level.set('locations', [LOCATION_DEFAULTS.unusedId]);
    admin_location_level.save();
    another_location_level.set('locations', [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.equal(location.get('location_level.name'), 'another');
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.rollback();
    location.rollbackRelated();
    assert.equal(location.get('location_level.name'), LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    assert.deepEqual(another_location_level.get('locations'), [LOCATION_DEFAULTS.unusedId]);
    assert.deepEqual(admin_location_level.get('locations'), [LOCATION_DEFAULTS.unusedId, LOCATION_DEFAULTS.idOne]);
    assert.ok(another_location_level.get('isNotDirty'));
    assert.ok(admin_location_level.get('isNotDirty'));
});
