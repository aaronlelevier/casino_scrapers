import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import { dtd_payload, dtd_payload_field } from 'bsrs-ember/tests/helpers/payloads/dtd';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';

var store, field, option, uuid;

module('unit: field test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:field', 'model:option', 'model:field-option']);
        run(() => {
            field = store.push('field', {id: FD.idOne, required: FD.requiredOne});
            option = store.push('option', {id: OD.idOne});
        });
    }
});

test('label isDirty', (assert) => {
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    store.push('field', {id: FD.idOne, label: FD.labelOne});
    assert.ok(field.get('isDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
    store.push('field', {id: FD.idOne, label: ''});
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    assert.ok(field.get('isNotDirty'));
});

test('type isDirty', (assert) => {
    assert.ok(field.get('isNotDirty'));
    store.push('field', {id: FD.idOne, type: FD.typeOne});
    assert.ok(field.get('isDirty'));
    store.push('field', {id: FD.idOne, type: ''});
    assert.ok(field.get('isNotDirty'));
});

test('required isDirty', (assert) => {
    assert.ok(field.get('isNotDirty'));
    store.push('field', {id: FD.idOne, required: FD.requiredTwo});
    assert.ok(field.get('isDirty'));
    store.push('field', {id: FD.idOne, required: FD.requiredOne});
    assert.ok(field.get('isNotDirty'));
});

test('option relationship is setup correctly', (assert) => {
    assert.ok(!field.get('option'));
    run(() => {
        field = store.push('field', {id: FD.idOne, field_option_fks: [1]});
        store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
    });
    assert.equal(field.get('field_options').get('length'), 1);
    assert.equal(field.get('field_options').objectAt(0).get('id'), 1);
    assert.equal(field.get('options').get('length'), 1);
    assert.equal(field.get('options').objectAt(0).get('id'), OD.idOne);
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('add_option', (assert) => {
    assert.equal(field.get('options').get('length'), 0);
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.ok(field.get('isDirtyOrRelatedDirty'));
});

test('remove_option', (assert) => {
    run(() => {
        field = store.push('field', {id: FD.idOne, field_option_fks: [1]});
        store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
    });
    assert.equal(field.get('options').get('length'), 1);
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.remove_option(OD.idOne);
    assert.equal(field.get('options').get('length'), 0);
    assert.ok(field.get('isDirtyOrRelatedDirty'));
});

test('isDirtyOrRelatedDirty - optionsIsDirty', (assert) => {
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    store.push('option', {id: OD.idOne, text: OD.textOne});
    assert.ok(field.get('optionsIsDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
});

test('isDirtyOrRelatedDirty - optionsIsDirty - for an existing option', (assert) => {
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        field = store.push('field', {id: FD.idOne, field_option_fks: [1]});
        store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
    });
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        store.push('option', {id: OD.idOne, text: OD.textOne});
    });
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('optionsIsDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
});

test('saveRelated - with no related', (assert) => {
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        store.push('field', {id: FD.idOne, required: FD.requiredTwo});
    });
    assert.ok(field.get('isDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
    field.saveRelated();
    assert.ok(field.get('isNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated - with related Options', (assert) => {
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.ok(field.get('optionsIsDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
    field.saveRelated();
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackRelated for related options', (assert) => {
    assert.ok(option.get('isNotDirty'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    run(() => {
        store.push('option', {id: OD.idOne, text: OD.textOne});
    });
    assert.ok(option.get('isDirty'));
    field.add_option({id: OD.idOne});
    assert.ok(field.get('optionsIsDirty'));
    assert.ok(field.get('isDirtyOrRelatedDirty'));
    field.rollback();
    assert.ok(option.get('isNotDirty'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('removeRecord', (assert) => {
    assert.equal(store.find('field').get('length'), 1);
    field.removeRecord();
    assert.equal(store.find('field').get('length'), 0);
});

test('serialize', (assert) => {
    let fieldData = {id: FD.idOne, label: FD.labelOne, type: FD.typeOne, required: FD.requiredOne};
    let optionData = {id: OD.idOne, text: OD.textOne, order: OD.orderOne};
    let rawData = Object.assign({}, fieldData, {options: [optionData]});
    run(() => {
        field = store.push('field', fieldData);
        option = store.push('option', optionData);
    });
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.equal(field.get('options').objectAt(0).get('id'), OD.idOne);
    let data = field.serialize();
    assert.deepEqual(rawData, data);
});
