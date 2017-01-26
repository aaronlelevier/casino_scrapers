import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import LD from 'bsrs-ember/vendor/defaults/location';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, locationz, location_detail;

module('unit: location list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:location', 'model:location-list', 'model:general-status-list', 'model:location-level']);
        run(() => {
            location_detail = store.push('location', {id: LD.idOne, number: 'scoo', location_level_fk: LLD.idOne});
            locationz = store.push('location-list', {id: LD.idOne});
            store.push('general-status-list', {id: 1, name: 'wat', locations: [LD.idOne]});
            store.push('general-status-list', {id: 2, name: 'wat'});
            store.push('location-level', {id: LLD.idOne, locations: [LD.idOne]});
        });
    }
});

test('location status returns one status', (assert) => {
    assert.equal(locationz.get('status.id'), 1);
    assert.equal(locationz.get('status.name'), 'wat');
    assert.equal(locationz.get('status_class'), 'wat');
});

test('location list is dirty trackable based on location', (assert) => {
    assert.ok(locationz.get('isNotDirtyOrRelatedNotDirty'));
    location_detail.set('number', '123');
    assert.ok(location_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(locationz.get('isDirtyOrRelatedDirty'));
});

test('location level returns one level', (assert) => {
    assert.equal(locationz.get('location_level.id'), LLD.idOne);
});
