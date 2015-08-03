import {test, module} from 'qunit';
import Location from 'bsrs-ember/models/location';
import LOCATION_DEFAULTS from 'bsrs-ember/vendor/defaults/location';

module('unit: location attrs test');

test('default state for name on location model is undefined', (assert) => {
    var location = Location.create({id: LOCATION_DEFAULTS.id, name: undefined});
    assert.ok(location.get('isNotDirty'));
    location.set('name', 'ABC124');
    assert.ok(location.get('isDirty'));
    location.set('name', '');
    assert.ok(location.get('isNotDirty'));
});

test('default state for number on location model is undefined', (assert) => {
    var location = Location.create({id: LOCATION_DEFAULTS.id, number: undefined});
    assert.ok(location.get('isNotDirty'));
    location.set('number', 'ZZZ124');
    assert.ok(location.get('isDirty'));
    location.set('number', '');
    assert.ok(location.get('isNotDirty'));
});

