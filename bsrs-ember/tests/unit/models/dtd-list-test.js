import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import DTD from 'bsrs-ember/vendor/defaults/dtd';

var store, dtd, dtd_detail;

module('unit: dtd list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:dtd', 'model:dtd-list']);
        run(() => {
            dtd_detail = store.push('dtd', {id: DTD.idOne, key: 'bill'});
            dtd = store.push('dtd-list', {id: DTD.idOne});
        });
    }
});

test('dtd list is dirty trackable based on dtd', (assert) => {
    assert.ok(dtd.get('isNotDirtyOrRelatedNotDirty'));
    dtd_detail.set('key', '123');
    assert.ok(dtd_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(dtd.get('isDirtyOrRelatedDirty'));
});


