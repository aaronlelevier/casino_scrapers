import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import {xhr, clearxhr} from 'bsrs-ember/tests/helpers/xhr';
import CategoryRepository from 'bsrs-ember/repositories/category';
import CategoryDeserializer from 'bsrs-ember/deserializers/category';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

var store, original_xhr;

module('unit: category repository test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category']);
        original_xhr = PromiseMixin.xhr;
        PromiseMixin.xhr = function() {
            return {
                then() {}
            };
        };
    },
    afterEach() {
        PromiseMixin.xhr = original_xhr;
    }
});

test('findCategoryChildren will format url correctly for search criteria and return correct categories that are already present in store', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: 'abc'});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: 'abcd'});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: 'xyz'});
    store.push('category', {id: CATEGORY_DEFAULTS.anotherId, name: 'mmm'});
    let subject = CategoryRepository.create({store: store});
    let category_array_proxy = subject.findCategoryChildren('abc');
    assert.equal(category_array_proxy.get('length'), 2);
});

test('findCategoryChildren will lower case search', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: 'abc'});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: 'abcd'});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: 'xyz'});
    store.push('category', {id: CATEGORY_DEFAULTS.anotherId, name: 'mmm'});
    let subject = CategoryRepository.create({store: store});
    let category_array_proxy = subject.findCategoryChildren('Abc');
    assert.equal(category_array_proxy.get('length'), 2);
});

test('findCategoryChildren will return categories without new flag', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: 'abc', new: true});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: 'abcd'});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: 'xyz'});
    store.push('category', {id: CATEGORY_DEFAULTS.anotherId, name: 'mmm'});
    let subject = CategoryRepository.create({store: store});
    let category_array_proxy = subject.findCategoryChildren('Abc');
    assert.equal(category_array_proxy.get('length'), 1);
});

test('findTopLevelCategories will format url correctly for search criteria and return correct categories that are already present in store', (assert) => {
    store.push('category', {id: CATEGORY_DEFAULTS.idOne, name: 'abc'});
    store.push('category', {id: CATEGORY_DEFAULTS.idTwo, name: 'abcd'});
    store.push('category', {id: CATEGORY_DEFAULTS.unusedId, name: 'xyz', parent_id: CATEGORY_DEFAULTS.idTwo});
    store.push('category', {id: CATEGORY_DEFAULTS.anotherId, name: 'mmm', parent_id: CATEGORY_DEFAULTS.idOne});
    let subject = CategoryRepository.create({store: store});
    let category_array_proxy = subject.findTopLevelCategories();
    assert.equal(category_array_proxy.get('length'), 2);
});
