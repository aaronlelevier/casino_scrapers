import Ember from 'ember';
const { run } = Ember;
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/category';

var store, categoryz, category_detail;

module('unit: category list test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:category', 'model:category-list', 'service:i18n']);
        run(() => {
            category_detail = store.push('category', {id: CD.idOne, name: 'scoo'});
            categoryz = store.push('category-list', {id: CD.idOne});
        });
    }
});

test('category list is dirty trackable based on category', (assert) => {
    assert.ok(categoryz.get('isNotDirtyOrRelatedNotDirty'));
    category_detail.set('name', '123');
    assert.ok(category_detail.get('isDirtyOrRelatedDirty'));
    assert.ok(categoryz.get('isDirtyOrRelatedDirty'));
});


