import {test, module} from 'qunit';
import Category from 'bsrs-ember/models/category';
import CATEGORY_DEFAULTS from 'bsrs-ember/vendor/defaults/category';

module('unit: category attrs test');

test('default state for name, description, label, cost_amount, and cost_code on category model is undefined', (assert) => {
  let category = Category.create({id: CATEGORY_DEFAULTS.idOne, name: undefined});
  assert.ok(category.get('isNotDirty'));
  category.set('name', 'scott');
  assert.ok(category.get('isDirty'));
  category.set('name', '');
  assert.ok(category.get('isNotDirty'));
  category.set('description', 'this description');
  assert.ok(category.get('isDirty'));
  category.set('description', '');
  assert.ok(category.get('isNotDirty'));
  category.set('label', 'this categorys self referencing child');
  assert.ok(category.get('isDirty'));
  category.set('label', '');
  assert.ok(category.get('isNotDirty'));
  category.set('cost_amount', '40.00');
  assert.ok(category.get('isDirty'));
  category.set('cost_amount', '');
  assert.ok(category.get('isNotDirty'));
  category.set('cost_code', '1234');
  assert.ok(category.get('isDirty'));
  category.set('cost_code', '');
  assert.ok(category.get('isNotDirty'));
});

