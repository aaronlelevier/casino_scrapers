import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/category';
import CCD from 'bsrs-ember/vendor/defaults/category-children';

var store, category, run = Ember.run;

module('unit: category test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:category-children', 'service:i18n']);
        run(() => {
            category = store.push('category', {id: CD.idOne});
        });
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
    assert.equal(category.get('children').get('length'), 0);
    run(() => {
        store.push('category', {id:3});
        store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: 3});
    });
    assert.equal(category.get('children').get('length'), 1);
    run(function() {
        store.push('category', {id:4});
        store.push('category-children', {id: CCD.idTwo, category_pk: CD.idOne, children_pk: 4});
    });
    assert.equal(category.get('children').get('length'), 2);
    run(function() {
        store.push('category', {id:5});
        store.push('category-children', {id:CCD.idThree, category_pk: CD.idOne, children_pk: 5});
    });
    assert.equal(category.get('children').get('length'), 3);
});

test('add_children will add child to category fks array', (assert) => {
    const cat_one = {id:8};
    assert.equal(category.get('children').get('length'), 0);
    category.add_children(cat_one);
    assert.equal(category.get('children').get('length'), 1);
    category.add_children(cat_one);
    assert.equal(category.get('children').get('length'), 1);
    assert.deepEqual(category.get('category_children_fks'), []);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('remove_child will remove child to category fks array', (assert) => {
    store.push('category', {id: 8});
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: 8});
    assert.equal(category.get('children').get('length'), 1);
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 0);
});

test('add and remove work as expected', (assert) => {
    const cat = {id:8};
    assert.equal(category.get('children').get('length'), 0);
    category.add_children(cat);
    assert.equal(category.get('children').get('length'), 1);
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 0);
});

test('category is dirty when child is added or removed (starting with none)', (assert) => {
    const cat_one = {id:8};
    assert.equal(category.get('children').get('length'), 0);
    category.add_children(cat_one);
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_children(cat_one);
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('category is dirty when child is added or removed (starting with one child)', (assert) => {
    store.push('category', {id: CD.idOne, category_children_fks: [CCD.idOne]});
    store.push('category', {id: 8});
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: 8});
    const cat_one = {id:8};
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 0);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.add_children(cat_one);
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    store.push('category', {id:9});
    category.add_children({id: 9});
    assert.equal(category.get('children').get('length'), 2);
    assert.ok(category.get('category_children_fks'), [8,9]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
});

test('rollback children will revert and reboot the dirty children to clean', (assert) => {
    store.push('category', {id: CD.idOne, category_children_fks: [CCD.idOne]});
    store.push('category-children', {id: CCD.idOne, category_pk: CD.idOne, children_pk: 8});
    store.push('category', {id: 8});
    const cat_two = {id: 9};
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 0);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.rollback();
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_children(cat_two);
    assert.equal(category.get('children').get('length'), 2);
    assert.deepEqual(category.get('category_children_fks'), [CCD.idOne]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.rollback();
    assert.equal(category.get('children').get('length'), 1);
    assert.deepEqual(category.get('category_children_fks'), [CCD.idOne]);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_children(cat_two);
    assert.equal(category.get('children').get('length'), 2);
    assert.deepEqual(category.get('category_children_fks'), [CCD.idOne]);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('children').get('length'), 2);
    assert.deepEqual(category.get('category_children_fks').length, 2);
    category.remove_children(8);
    assert.equal(category.get('children').get('length'), 1);
    assert.deepEqual(category.get('category_children_fks').length, 2);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('children').get('length'), 1);
});

test('category is not dry after save (starting with not children)', (assert) => {
    category = store.push('category', {id: CD.idOne, category_children_fks: []});
    const cat = {id: 8};
    store.push('category', {id: 9});
    assert.equal(category.get('children').get('length'), 0);
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    category.add_children(cat);
    assert.equal(category.get('children').get('length'), 1);
    assert.ok(category.get('isDirtyOrRelatedDirty'));
    assert.equal(category.get('category_children_fks').length, 0);
    category.save();
    category.saveRelated();
    assert.ok(category.get('isNotDirtyOrRelatedNotDirty'));
    assert.equal(category.get('category_children_fks').length, 1);
    assert.equal(category.get('children').get('length'), 1);
});
