import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CCD from 'bsrs-ember/vendor/defaults/category-children';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';

var store, subject, category, run = Ember.run;

module('unit: category deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:category-list', 'model:category-children', 'service:i18n']);
        subject = CategoryDeserializer.create({simpleStore: store});
    }
});

test('category deserializer returns correct data with existing category (list)', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair,
                              label: CD.labelOne});
    store.push('category-list', {id: CD.unusedId, name: CD.nameTwo, description: CD.descriptionMaintenance});
    let json = [CF.generate(CD.idOne), CF.generate(CD.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    run(() => {
        subject.deserialize(response);
    });
    assert.ok(category.get('isNotDirty'));
    let categories = store.find('category-list');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirtyOrRelatedNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirtyOrRelatedNotDirty'), false);
});

test('category deserializer returns correct data with no existing category (list)', (assert) => {
    let json = [CF.generate(CD.idOne), CF.generate(CD.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    run(() => {
        subject.deserialize(response);
    });
    let categories = store.find('category-list');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('id'));
    assert.ok(categories.objectAt(1).get('id'));
    assert.equal(categories.objectAt(0).get('name'), CD.nameOne);
    assert.equal(categories.objectAt(1).get('name'), CD.nameOne);
});

test('category deserializer returns correct data (w/ children) with no existing category (detail)', (assert) => {
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    const category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(category.get('children').objectAt(0).get('id'), CD.idChild);
    let m2m = store.find('category-children');
    assert.equal(m2m.get('length'), 1);
    assert.equal(m2m.objectAt(0).get('category_pk'), CD.idOne);
    assert.equal(m2m.objectAt(0).get('children_pk'), CD.idChild);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
    assert.equal(category.get('sc_category_name'), CD.scCategoryNameOne);
});

test('category deserialized with null parent returns correct model with no related parent record (detail)', (assert) => {
    let response = CF.generate(CD.idOne);
    response.parent = null;
    run(() => {
        subject.deserialize(response, CD.idOne);
    });
    let categories = store.find('category');
    assert.equal(categories.get('length'), 1);
    assert.deepEqual(categories.objectAt(0).get('parent'), undefined);
});

test('category deserializer returns correct data with existing category and different children (detail)', (assert) => {
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne, category_children_fks: [CCD.idOne]});
    store.push('category', {id: CD.idTwo});
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: CD.idTwo});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    const m2m = store.find('category-children');
    assert.equal(m2m.get('length'), 2);
    category = store.find('category', CD.idOne);
    assert.equal(category.get('children').get('length'), 1);
    assert.equal(category.get('children').objectAt(0).get('id'), CD.idChild);
});

test('category deserializer returns correct data with existing category and same children (detail)', (assert) => {
    store.push('category', {id: CD.idOne, name: CD.nameOne, category_children_fks: [CCD.idOne]});
    store.push('category', {id: CD.idChild});
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: CD.idChild});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.equal(store.find('category', CD.idOne).get('children').objectAt(0).get('id'), CD.idChild);
});

test('category deserializer returns correct data with existing category that has no children (detail)', (assert) => {
    store.push('category', {id: CD.idOne, name: CD.nameOne});
    let json = CF.generate(CD.idOne);
    json.children = [];
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.equal(store.find('category', CD.idOne).get('children').get('length'), 0);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 1);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
});

test('category deserializer detail payload contains inherited object with: cost_amount and sc_category_name', assert => {
    let json = CF.detail(CD.idTwo);
    run(() => {
        subject.deserialize(json, CD.idTwo);
    });
    let categories = store.find('category', CD.idTwo);
    // cost_amount
    assert.equal(categories.get('inherited').cost_amount.value, null);
    assert.equal(categories.get('inherited').cost_amount.inherited_value, CD.costAmountOne);
    assert.equal(categories.get('inherited').cost_amount.inherits_from, 'category');
    assert.equal(categories.get('inherited').cost_amount.inherits_from_id, CD.idOne);
    // sc_category_name
    assert.equal(categories.get('inherited').sc_category_name.value, null);
    assert.equal(categories.get('inherited').sc_category_name.inherited_value, CD.scCategoryNameOne);
    assert.equal(categories.get('inherited').sc_category_name.inherits_from, 'category');
    assert.equal(categories.get('inherited').sc_category_name.inherits_from_id, CD.idOne);
    //cost_code
    assert.equal(categories.get('inherited').cost_code.value, null);
    assert.equal(categories.get('inherited').cost_code.inherited_value, CD.costCodeOne);
    assert.equal(categories.get('inherited').cost_code.inherits_from, 'category');
    assert.equal(categories.get('inherited').cost_code.inherits_from_id, CD.idOne);
});
