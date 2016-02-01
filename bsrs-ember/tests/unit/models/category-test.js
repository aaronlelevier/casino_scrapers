import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/category';

var store, uuid, category, run = Ember.run;

module('unit: category test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'service:i18n']);
    }
});

test('parent category returns associated model or undefined', (assert) => {
    category = store.push('category', {id: 1, parent_id: 2});
    store.push('category', {id: 2, name: 'x', parent_id: null});
    let parent = category.get('parent');
    assert.equal(parent.get('id'), 2);
    assert.equal(parent.get('name'), 'x');
    category.set('parent_id', null);
    parent = category.get('parent');
    assert.equal(parent, undefined);
});

/*CATEGORY TO CHILDREN M2M*/
test('children returns associated array or empty array', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: []});
    assert.equal(category.get('has_many_children').get('length'), 0);
    run(function() {
        store.push('category', {id:3});
    });
    category.set('children_fks', [3]);
    assert.equal(category.get('has_many_children').get('length'), 1);
    run(function() {
        store.push('category', {id:4});
    });
    category.set('children_fks', [4]);
    assert.equal(category.get('has_many_children').get('length'), 1);
    run(function() {
        store.push('category', {id:5});
    });
    category.set('children_fks', [4,5]);
    assert.equal(category.get('has_many_children').get('length'), 2);
});

test('add_child will add child to category fks array', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: []});
    const cat_one = {id:8};
    assert.equal(category.get('has_many_children').get('length'), 0);
    category.add_child(cat_one);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [8]);
    category.add_child(cat_one);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [8]);
});

test('remove_child will remove child to category fks array', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [8]});
    store.push('category', {id:8});
    assert.equal(category.get('has_many_children').get('length'), 1);
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
});

test('add and remove work as expected', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: []});
    const cat = {id:8};
    assert.equal(category.get('has_many_children').get('length'), 0);
    category.add_child(cat);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [8]);
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.deepEqual(category.get('children_fks'), []);
});

test('category is dirty when child is added or removed (starting with none)', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [], previous_children_fks: []});
    const cat_one = {id:8};
    assert.equal(category.get('has_many_children').get('length'), 0);
    category.add_child(cat_one);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat_one);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('category is dirty when child is added or removed (starting with one child)', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [8], previous_children_fks: [8]});
    const cat_one = {id:8};
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.add_child(cat_one);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    const cat_two = store.push('category', {id:9});
    category.add_child(cat_two);
    assert.equal(category.get('has_many_children').get('length'), 2);
    assert.ok(category.get('children_fks'), [8,9]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('rollback children will revert and reboot the dirty children to clean', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [8], previous_children_fks: [8]});
    const cat = store.push('category', {id: 8});
    const cat_two = {id: 9};
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.rollbackRelated();
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat_two);
    assert.equal(category.get('has_many_children').get('length'), 2);
    assert.deepEqual(category.get('children_fks'), [8,9]);
    assert.deepEqual(category.get('previous_children_fks'), [8]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.rollbackRelated();
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [8]);
    assert.deepEqual(category.get('previous_children_fks'), [8]);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat_two);
    assert.equal(category.get('has_many_children').get('length'), 2);
    assert.deepEqual(category.get('children_fks'), [8,9]);
    assert.deepEqual(category.get('previous_children_fks'), [8]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('has_many_children').get('length'), 2);
    assert.deepEqual(category.get('children_fks'), [8,9]);
    assert.deepEqual(category.get('previous_children_fks'), [8,9]);
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.deepEqual(category.get('children_fks'), [9]);
    assert.deepEqual(category.get('previous_children_fks'), [8,9]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('has_many_children').get('length'), 1);
});

test('children should be dirty even when the number of previous matches current', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [], previous_children_fks: []});
    const cat = {id: 8};
    const cat_two = {id: 9};
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.remove_child(8);
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat_two);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('category is not dry after save (starting with not children)', (assert) => {
    category = store.push('category', {id: CD.idOne, children_fks: [], previous_children_fks: []});
    const cat = {id: 8};
    store.push('category', {id: 9});
    assert.equal(category.get('has_many_children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_child(cat);
    assert.equal(category.get('has_many_children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.save();
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('has_many_children').get('length'), 1);
});
