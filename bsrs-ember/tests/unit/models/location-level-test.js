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

test('location level can have child location levels', (assert) => {
    var model = {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameRegion};
    var location_level = store.push('location-level', model);
    var location_level_child = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, parent_id: LOCATION_LEVEL_DEFAULTS.idOne});
    assert.equal(location_level.get('children').get('length'), 1);
    var location_level_child_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameDepartment, parent_id: LOCATION_LEVEL_DEFAULTS.idOne});
    assert.equal(location_level.get('children').get('length'), 2);
    var location_levels = location_level.get('children');
    model.parent_id = LOCATION_LEVEL_DEFAULTS.idOne;
    location_levels.push(model);
    assert.equal(location_level.get('children').get('length'), 2);
});
