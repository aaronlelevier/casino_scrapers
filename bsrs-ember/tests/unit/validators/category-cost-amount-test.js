import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/category';

let category;

moduleFor('validator:category-cost-amount', 'Unit | Validator | category-cost-amount', {
  needs: ['validator:messages', 'model:category'],
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    run(() => {
      this.store.push('category', {id: CD.idParent});
      category = this.store.push('category', {id: CD.idOne});
    });
  }
});

test('root category cost amount must be present', function(assert) {
  var validator = this.subject();
  assert.equal(validator.validate(null, null, category), 'errors.category.cost_amount');
  assert.equal(validator.validate('10', null, category), true);
});

test('child category has no cost amount', function(assert) {
  run(() => {
    this.store.push('category', {id: CD.idParent, categories: [CD.idOne]});
  });
  var validator = this.subject();
  assert.equal(validator.validate(null, null, category), true);
  assert.equal(validator.validate('10', null, category), true);
});

