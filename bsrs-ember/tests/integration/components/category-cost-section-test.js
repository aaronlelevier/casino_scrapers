import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import moment from 'moment';
import CD from 'bsrs-ember/vendor/defaults/category';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import page from 'bsrs-ember/tests/pages/category';
import waitFor from 'ember-test-helpers/wait';

let store, category;

moduleForComponent('category-detail-section', 'Integration | Component | category-detail-section', {
  integration: true,
  beforeEach() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:category']);
    run(() => {
      category = store.push('category', {
        id: CD.idOne,
        cost_amount: CD.costAmountOne,
        cost_currency: CurrencyD.id,
        inherited: {
          cost_amount: {
            value: CD.costAmountOne
          }
        }
      });
      store.push('currency', {
        id: CurrencyD.id,
        symbol: CurrencyD.symbol,
        name: CurrencyD.name,
        decimal_digits: CurrencyD.decimal_digits,
        code: CurrencyD.code,
        name_plural: CurrencyD.name_plural,
        rounding: CurrencyD.rounding,
        symbol_native: CurrencyD.symbol_native
      });
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('cost_amount inherited text should not show if there is a concrete value', function(assert) {
  this.model = category;
  this.render(hbs`{{
    categories/cost-section
    model=model
  }}`);
  assert.equal(page.costAmountValue, CD.costAmountOne);
  assert.equal(this.$('.t-inherited-msg-cost_amount').length, 0);
});

test('cost_amount validations', function(assert) {
  this.model = category;
  this.render(hbs`{{
    categories/cost-section
    model=model
  }}`);
  this.$('.t-amount').val('100').trigger('keyup');
  assert.equal(this.$('.t-amount').val(), '100');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  this.$('.t-amount').val('').trigger('keyup');
  return waitFor().then(() => {
    assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), 'errors.category.cost_amount');
  });
});

test('cost_amount inherited text should show if there is no concrete value', function(assert) {
  run(() => {
    category = store.push('category', {
      id: CD.idOne,
      cost_amount: null,
      inherited: {
        cost_amount: {
          value: null,
          inherited_from: 'category'
        }
      }
    });
  });
  this.model = category;
  this.render(hbs`{{
    categories/cost-section
    model=model
  }}`);
  assert.equal(page.costAmountValue, '');
  assert.equal(this.$('.t-inherited-msg-cost_amount').length, 1);
});
