import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

var container, registry, store;

module('unit: location test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('location is dirty or related is dirty when model has been updated', (assert) => {
    var location = store.push('location', {id: LOCATION_DEFAULTS.id, name: LOCATION_DEFAULTS.storeName});
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
    location.set('name', LOCATION_DEFAULTS.storeNameTwo);
    assert.ok(location.get('isDirty'));
    assert.ok(location.get('isDirtyOrRelatedDirty'));
    location.set('name', LOCATION_DEFAULTS.storeName);
    assert.ok(location.get('isNotDirty'));
    assert.ok(location.get('isNotDirtyOrRelatedNotDirty'));
});

