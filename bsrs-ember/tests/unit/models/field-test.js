import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import FD from 'bsrs-ember/vendor/defaults/field';
import OD from 'bsrs-ember/vendor/defaults/option';

var store, field, option;

module('unit: dtd field test', {
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
    store.push('field', {id: FD.idOne, type: undefined});
    assert.ok(field.get('isNotDirty'));
});

test('type - does not get overridden during init if type is diff than typeDefault', (assert) => {
    field = store.push('field', {id: FD.idTwo, type: FD.typeTwo});
    assert.notEqual(field.get('type'), field.get('typeDefault'));
});

test('types - are populated without being pushed into store', assert => {
    assert.equal(field.get('types').length, 9);
    assert.equal(field.get('types')[0], FD.typeOne);
    assert.equal(field.get('types')[1], FD.typeTwo);
    assert.equal(field.get('types')[2], FD.typeThree);
    assert.equal(field.get('types')[3], FD.typeFour);
    assert.equal(field.get('types')[4], FD.typeSix);
    assert.equal(field.get('types')[5], FD.typeSeven);
    assert.equal(field.get('types')[6], FD.typeEight);
    assert.equal(field.get('types')[7], FD.typeNine);
    assert.equal(field.get('types')[8], FD.typeTen);
});

test('typesWithOptions - field types that allow options', assert => {
    assert.equal(field.get('typesWithOptions').length, 2);
    assert.equal(field.get('typesWithOptions')[0], FD.typeFour);
    assert.equal(field.get('typesWithOptions')[1], FD.typeSix);
});

test('typeDefault', (assert) => {
    field = store.push('field', {id: 42});
    assert.equal(field.get('id'), 42);
    assert.equal(field.get('typeDefault'), field.get('types')[0]);
});

test('required isDirty', (assert) => {
    assert.ok(field.get('isNotDirty'));
    store.push('field', {id: FD.idOne, required: FD.requiredTwo});
    assert.ok(field.get('isDirty'));
    store.push('field', {id: FD.idOne, required: FD.requiredOne});
    assert.ok(field.get('isNotDirty'));
});

test('order isDirty', (assert) => {
    assert.ok(field.get('isNotDirty'));
    store.push('field', {id: FD.idOne, order: FD.orderTwo});
    assert.ok(field.get('isDirty'));
    store.push('field', {id: FD.idOne, order: undefined});
    assert.ok(field.get('isNotDirty'));
});

test('serialize - default for required', (assert) => {
    field = store.push('field', {id: FD.idOne, required: undefined});
    let data = field.serialize();
    assert.equal(data.id, field.get('id'));
    assert.equal(data.required, false);
    field = store.push('field', {id: FD.idOne, required: false});
    data = field.serialize();
    assert.equal(data.required, false);
    field = store.push('field', {id: FD.idOne, required: true});
    data = field.serialize();
    assert.equal(data.required, true);
});

test('serialize - default for type', (assert) => {
    field = store.push('field', {id: FD.idOne, type: undefined});
    let data = field.serialize();
    assert.equal(data.id, field.get('id'));
    assert.equal(data.type, FD.typeOne);
    field = store.push('field', {id: FD.idOne, type: FD.typeTwo});
    data = field.serialize();
    assert.equal(data.type, FD.typeTwo);
});

// Options

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

test('add_option - adding an empty Option does not dirty the Field', (assert) => {
    assert.equal(field.get('options').get('length'), 0);
    assert.notOk(field.get('optionsIsDirtyContainer'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.notOk(field.get('optionsIsDirtyContainer'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('remove_option - simulates an Option on the server that gets removed thus dirtying the Field', (assert) => {
    run(() => {
        field = store.push('field', {id: FD.idOne, field_options_fks: [1]});
        store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
    });
    assert.equal(field.get('options').get('length'), 1);
    assert.notOk(field.get('optionsIsDirtyContainer'));
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.remove_option(OD.idOne);
    assert.equal(field.get('options').get('length'), 0);
    assert.ok(field.get('optionsIsDirtyContainer'));
    assert.ok(field.get('optionsIsDirty'));
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

// Field and Options

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

// saveRelated

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
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
    field.saveRelated();
    assert.ok(field.get('optionsIsNotDirty'));
    assert.ok(field.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback for related options', (assert) => {
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
    let fieldData = {id: FD.idOne, label: FD.labelOne, type: FD.typeOne, required: FD.requiredOne, order: undefined};
    let optionData = {id: OD.idOne, text: OD.textOne, order: OD.orderOne};
    let rawData = Object.assign({}, fieldData, {options: [optionData]});
    run(() => {
        field = store.push('field', fieldData);
        store.push('field-option', {id: 1, field_pk: FD.idOne, option_pk: OD.idOne});
        option = store.push('option', optionData);
    });
    field.add_option({id: OD.idOne});
    assert.equal(field.get('options').get('length'), 1);
    assert.equal(field.get('options').objectAt(0).get('id'), OD.idOne);
    let data = field.serialize();
    assert.deepEqual(rawData, data);
});
