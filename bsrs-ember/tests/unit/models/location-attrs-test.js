import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

var store;

module('unit: location attrs test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-level']);
    }
});

test('location is dirty or related is dirty when name has been updated', (assert) => {
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: LOCATION_DEFAULTS.storeName});
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
    let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, name: undefined});
    assert.ok(location.get('isNotDirty'));
    location.set('name', 'ABC124');
    assert.ok(location.get('isDirty'));
    location.set('name', '');
    assert.ok(location.get('isNotDirty'));
});
