import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { dtd_payload, dtd_payload_link } from 'bsrs-ember/tests/helpers/payloads/dtd';
import OD from 'bsrs-ember/vendor/defaults/option';

var store, option, uuid;

module('unit: option test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:option']);
        run(() => {
            option = store.push('option', {id: OD.idOne});
        });
    }
});

test('text isDirty', (assert) => {
    assert.ok(option.get('isNotDirty'));
    store.push('option', {id: OD.idOne, text: OD.textOne});
    assert.ok(option.get('isDirty'));
    store.push('option', {id: OD.idOne, text: ''});
    assert.ok(option.get('isNotDirty'));
});

test('order isDirty', (assert) => {
    assert.ok(option.get('isNotDirty'));
    store.push('option', {id: OD.idOne, order: OD.orderOne});
    assert.ok(option.get('isDirty'));
    store.push('option', {id: OD.idOne, order: undefined});
    assert.ok(option.get('isNotDirty'));
});

