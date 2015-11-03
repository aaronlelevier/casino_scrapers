import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';

var store;

module('unit: category deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category']);
    }
});

test('category deserializer returns correct data with existing category (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne});
    let category_unused = store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: CATEGORY_DEFAULTS.nameTwo, description: CATEGORY_DEFAULTS.descriptionMaintenance});
    let json = [CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne), CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    assert.ok(category.get('isNotDirty'));
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with no existing category (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let json = [CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne), CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data (w/ children) with no existing category (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data (w/ children) with no existing category (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    subject.deserialize(json, CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserialized with null parent returns correct model with one without related parent record and one with (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let json = [CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne), CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.unusedId)];
    json[0].parent = null;
    json[1].parent = {id: CATEGORY_DEFAULTS.idOne};
    let response = {'count':2,'next':null,'previous':null,'results': json};
    subject.deserialize(response);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.deepEqual(categories.objectAt(0).get('parent'), undefined);
    assert.deepEqual(categories.objectAt(1).get('parent').get('id'), CATEGORY_DEFAULTS.idOne);
});

test('category deserialized with null parent returns correct model with no related parent record (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let response = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    response.parent = null;
    subject.deserialize(response, CATEGORY_DEFAULTS.idOne);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 1);
    assert.deepEqual(categories.objectAt(0).get('parent'), undefined);
});

test('category deserializer returns correct data with existing category and different children (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne, children:[{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, children: []}]});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    subject.deserialize(json, CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category and different children (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne, children:[{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, children: []}]});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category and same children (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne, children:[{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameThree, children: []}]});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    subject.deserialize(json, CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category and same children (list)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne, children:[{id: CATEGORY_DEFAULTS.idChild, name: CATEGORY_DEFAULTS.nameThree, children: []}]});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    let response = {'count':1,'next':null,'previous':null,'results': [json]};
    subject.deserialize(response);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});
