import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';

var container, registry, store;

module('unit: location level test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location-level']);
    },
    afterEach() {
        container = null;
        registry = null;
        store = null;
    }
});

test('location level is dirty when model has been updated', (assert) => {
    var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
    assert.ok(location_level.get('isNotDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameCompany);
    assert.ok(location_level.get('isDirty'));
    location_level.set('name', LOCATION_LEVEL_DEFAULTS.nameRegion);
    assert.ok(location_level.get('isNotDirty'));
});


