import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import OD from 'bsrs-ember/vendor/defaults/option';

var store, option;

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
    store.push('option', {id: OD.idOne, order: ''});
    assert.ok(option.get('isNotDirty'));
});

test('removeRecord', (assert) => {
    assert.equal(store.find('option').get('length'), 1);
    option.removeRecord();
    assert.equal(store.find('option').get('length'), 0);
});

test('serialize', (assert) => {
    let rawData = {id: OD.idOne, text: OD.textOne, order: OD.orderOne};
    run(() => {
        store.push('option', rawData);
    });
    let data = option.serialize();
    assert.deepEqual(rawData, data);
});

test('serialize - coerce order to an Int', (assert) => {
    let rawData = {id: OD.idOne, order: '1'};
    run(() => {
        store.push('option', rawData);
    });
    let data = option.serialize();
    assert.ok(data.order === 1);
});
