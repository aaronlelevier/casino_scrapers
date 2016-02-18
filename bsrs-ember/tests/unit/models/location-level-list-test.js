import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, locationz_level, location_level_detail;

module('unit: location level list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location-level', 'model:location-level-list']);
        run(() => {
            location_level_detail = store.push('location-level', {id: LLD.idOne, name: 'scoo'});
            locationz_level = store.push('location-level-list', {id: LLD.idOne});
        });
    }
});

test('location list is dirty trackable based on location', (assert) => {
    assert.ok(locationz_level.get('isNotDirtyOrRelatedNotDirty'));
    location_level_detail.set('name', '123');
    assert.ok(location_level_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(locationz_level.get('isDirtyOrRelatedDirty'));
});

