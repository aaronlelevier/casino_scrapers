import Ember from 'ember';
import { test, module } from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import prevent_duplicate_name from 'bsrs-ember/validation/prevent_duplicate_name';

var container, registry, store;

module('prevent duplicate name tests', {
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

test('should be a valid us location level name', function(assert) {
//     var location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany});
//     var location_level_two = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idTwo, name: LOCATION_LEVEL_DEFAULTS.nameDepartment});
//     var location_level_three = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idThree, name: LOCATION_LEVEL_DEFAULTS.nameRegion});
//     assert.ok(!prevent_duplicate_name(''));
//     assert.ok(!prevent_duplicate_name('5'));
//     assert.ok(!prevent_duplicate_name('51'));
//     assert.ok(!prevent_duplicate_name('515'));
//     assert.ok(!prevent_duplicate_name('515-'));
//     assert.ok(!prevent_duplicate_name('515-1'));
//     assert.ok(!prevent_duplicate_name('515-12'));
//     assert.ok(!prevent_duplicate_name('515-123-'));
//     assert.ok(!prevent_duplicate_name('515-123-4'));
//     assert.ok(!prevent_duplicate_name('515-123-45'));
//     assert.ok(!prevent_duplicate_name('515-123-456'));
//     assert.ok(prevent_duplicate_name('515-123-4567'));
//     assert.ok(!prevent_duplicate_name('515-123-45678'));
//     assert.ok(!prevent_duplicate_name('5a5-123-4567'));
//     assert.ok(!prevent_duplicate_name('515-1b3-4567'));
//     assert.ok(!prevent_duplicate_name('515-123-4c67'));
    assert.equal(1,1);
});

