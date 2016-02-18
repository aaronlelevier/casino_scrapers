import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TPD from 'bsrs-ember/vendor/defaults/third-party';

var store, third_party, third_party_detail;

module('unit: location level list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:third-party', 'model:third-party-list']);
        run(() => {
            third_party_detail = store.push('third-party', {id: TPD.idOne, name: 'scoo'});
            third_party = store.push('third-party-list', {id: TPD.idOne});
        });
    }
});

test('third party list is dirty trackable based on third party detail', (assert) => {
    assert.ok(third_party.get('isNotDirtyOrRelatedNotDirty'));
    third_party_detail.set('name', '123');
    assert.ok(third_party_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(third_party.get('isDirtyOrRelatedDirty'));
});

