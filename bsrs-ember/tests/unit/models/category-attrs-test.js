import {test, module} from 'qunit';
import Category from 'bsrs-ember/models/category';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

module('unit: category attrs test');

test('default state for name on category model is an empty array', (assert) => {
    var category = Category.create({id: CATEGORY_DEFAULTS.idOne, name: undefined});
    assert.ok(category.get('isNotDirty'));
    category.set('name', 'scott');
    assert.ok(category.get('isDirty'));
    category.set('name', '');
    assert.ok(category.get('isNotDirty'));
});

