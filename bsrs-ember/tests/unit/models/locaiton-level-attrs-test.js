import {test, module} from 'qunit';
import Location from 'bsrs-ember/models/location';
import LOCATION_LEVEL_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

module('unit: location level attrs test');

test('default state for name on location level model is undefined', (assert) => {
    var location = Location.create({id: LOCATION_LEVEL_DEFAULTS.idOne, name: undefined});
    assert.ok(location.get('isNotDirty'));
    location.set('name', 'ABC124');
    assert.ok(location.get('isDirty'));
    location.set('name', '');
    assert.ok(location.get('isNotDirty'));
});


