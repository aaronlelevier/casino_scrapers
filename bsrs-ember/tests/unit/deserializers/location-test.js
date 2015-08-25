import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LOCATION_FIXTURES from 'bsrs-ember/vendor/location_fixtures';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location-level';
import LocationDeserializer from 'bsrs-ember/deserializers/location';

let container, store, registry;

module('sco unit: location deserializer test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:location', 'model:location-level']);
    },
    afterEach() {
        store = null;
        container = null;
        registry = null;
    }
});

// test('location deserializer returns correct data (list)', (assert) => {
//     assert.equal(1,2)
//     let subject = LocationDeserializer.create({store: store});
//     let location = store.push('location', {id: LOCATION_DEFAULTS.idOne, location_level_fk: LOCATION_LEVEL_DEFAULTS.idOne});
//     let location_level = store.push('location-level', {id: LOCATION_LEVEL_DEFAULTS.idOne, name: LOCATION_LEVEL_DEFAULTS.nameCompany, locations: [ROLE_DEFAULTS.idOne]});
// });
