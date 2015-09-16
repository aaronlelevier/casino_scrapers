import Ember from 'ember';
import {test, module} from 'qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CATEGORY_FIXTURES from 'bsrs-ember/vendor/category_fixtures';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';

let container, store, registry;

module('unit: location deserializer test', {
    beforeEach() {
        registry = new Ember.Registry();
        container = registry.container();
        store = module_registry(container, registry, ['model:category']);
    },
    afterEach() {
        store = null;
        container = null;
        registry = null;
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

test('category deserializer returns correct data with no existing category (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    subject.deserialize(json, CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    // assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.unusedId).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category and different children (detail)', (assert) => {
    let subject = CategoryDeserializer.create({store: store});
    let category = store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: CATEGORY_DEFAULTS.nameOne, description: CATEGORY_DEFAULTS.descriptionRepair, 
                              label: CATEGORY_DEFAULTS.labelOne, children:[{id: CATEGORY_DEFAULTS.idTwo, name: CATEGORY_DEFAULTS.nameTwo, children: []}]});
    let json = CATEGORY_FIXTURES.generate(CATEGORY_DEFAULTS.idOne);
    json.children = CATEGORY_FIXTURES.children();
    subject.deserialize(json, CATEGORY_DEFAULTS.idOne);
    assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.idOne).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    // assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.unusedId).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
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
    // assert.deepEqual(store.find('category', CATEGORY_DEFAULTS.unusedId).get('children_fks'), [CATEGORY_DEFAULTS.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});
