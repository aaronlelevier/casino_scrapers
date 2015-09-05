import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

var container, registry, store;

module('unit: location attrs test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location', 'model:location-level']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('location is dirty or related is dirty when name has been updated', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.set('name', LOCATION_DEFAULTS.storeName);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

test('default state for name on location model is undefined', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: undefined});
    assert.ok(location.get('isNotDirty'));
    location.set('name', 'ABC124');
    assert.ok(location.get('isDirty'));
    location.set('name', '');
    assert.ok(location.get('isNotDirty'));
});
