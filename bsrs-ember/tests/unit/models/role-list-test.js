import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import RD from 'bsrs-ember/vendor/defaults/role';
import LLD from 'bsrs-ember/vendor/defaults/location-level';

var store, rolez, role_detail;

module('unit: role list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:role', 'model:role-list', 'model:location-level']);
        run(() => {
            role_detail = store.push('role', {id: RD.idOne, name: 'scoo', location_level_fk: LLD.idOne});
            rolez = store.push('role-list', {id: RD.idOne, location_level_fk: LLD.idOne});
            store.push('location-level', {id: LLD.idOne, roles: [RD.idOne]});
        });
    }
});

test('role list is dirty trackable based on role', (assert) => {
    assert.ok(rolez.get('isNotDirtyOrRelatedNotDirty'));
    role_detail.set('name', '123');
    assert.ok(role_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(rolez.get('isDirtyOrRelatedDirty'));
});

test('location level returns one level', (assert) => {
    assert.equal(rolez.get('location_level.id'), LLD.idOne);
});
