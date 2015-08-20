import {test, module} from 'qunit';
import LocationLevel from 'bsrs-ember/models/location-level';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

module('unit: location level attrs test');

test('default state for name on location level model', (assert) => {
    var location_level = LocationLevel.create({id: LOCATION_LEVEL_DEFAULTS.idOne, name: undefined});
    assert.ok(location_level.get('isNotDirty'));
    location_level.set('name', 'ABC124');
    assert.ok(location_level.get('isDirty'));
    location_level.set('name', '');
    assert.ok(location_level.get('isNotDirty'));
});

test('default state for locations on location level model', (assert) => {
    var location_level = LocationLevel.create({id: LOCATION_LEVEL_DEFAULTS.idOne, locations: undefined});
    assert.ok(location_level.get('isNotDirty'));
    location_level.set('locations', [1, 2, 3]);
    assert.ok(location_level.get('isDirty'));
    location_level.set('locations', []);
    assert.ok(location_level.get('isNotDirty'));
});
