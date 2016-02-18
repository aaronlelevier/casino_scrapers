import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CF from 'bsrs-ember/vendor/category_fixtures';
import CD from 'bsrs-ember/vendor/defaults/category';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';

var store, subject, category, category_unused, run = Ember.run;

module('unit: category deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:category-list', 'service:i18n']);
        subject = CategoryDeserializer.create({store: store});
    }
});

test('category deserializer returns correct data with existing category (list)', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne});
    category_unused = store.push('category', {id: CD.unusedId, name: CD.nameTwo, description: CD.descriptionMaintenance});
    let json = [CF.generate(CD.idOne), CF.generate(CD.unusedId)];
    let response = {'count':2,'next':null,'previous':null,'results': json};
    run(() => {
        subject.deserialize(response);
    });
    assert.ok(category.get('isNotDirty'));
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
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
    assert.deepEqual(store.find('category', CD.idOne).get('children_fks'), [CD.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
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
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne, has_many_children:[{id: CD.idTwo, name: CD.nameTwo, children: []}], children_fks: [CD.idTwo], previous_children_fks: [CD.idTwo]});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.deepEqual(store.find('category', CD.idOne).get('children_fks'), [CD.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category and same children (detail)', (assert) => {
    let category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne, has_many_children:[{id: CD.idChild, name: CD.nameThree, children: []}], children_fks: [CD.idChild], previous_children_fks: [CD.idChild]});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.deepEqual(store.find('category', CD.idOne).get('children_fks'), [CD.idChild]);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 2);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
    assert.ok(categories.objectAt(1).get('isNotDirty'), false);
});

test('category deserializer returns correct data with existing category that has no children (detail)', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                            label: CD.labelOne, has_many_children:[{id: CD.idChild, name: CD.nameThree, children: []}]});
    let json = CF.generate(CD.idOne);
    json.children = [];
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.deepEqual(store.find('category', CD.idOne).get('children_fks'), []);
    let categories = store.find('category');
    assert.equal(categories.get('length'), 1);
    assert.ok(categories.objectAt(0).get('isNotDirty'), false);
});

test('deserializer correctly sets previous_children_fks', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne, has_many_children:[{id: CD.idChild, name: CD.nameThree, children: []}], children_fks: [CD.idChild], previous_children_fks: [CD.idChild]});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.deepEqual(category.get('previous_children_fks'), [CD.idChild]);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserializer correctly sets previous_children_fks with no children to start', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne, has_many_children:[]});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    assert.deepEqual(category.get('previous_children_fks'), [CD.idChild]);
});

test('deserializer correctly sets previous_children_fks with different array to start', (assert) => {
    category = store.push('category', {id: CD.idOne, name: CD.nameOne, description: CD.descriptionRepair, 
                              label: CD.labelOne, has_many_children:[{id: CD.idTwo, name: CD.nameThree, children: []}], previous_children_fks: [CD.idTwo], children_fks: [CD.idTwo]});
    let json = CF.generate(CD.idOne);
    json.children = CF.children();
    run(() => {
        subject.deserialize(json, CD.idOne);
    });
    category = store.find('category', CD.idOne);
    assert.deepEqual(category.get('previous_children_fks'), [CD.idChild]);
});
