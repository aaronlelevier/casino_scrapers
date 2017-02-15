import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import moment from 'moment';
import CD from 'bsrs-ember/vendor/defaults/category';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import page from 'bsrs-ember/tests/pages/category';
import wait from 'ember-test-helpers/wait';

const ERR_TEXT = '.validated-input-error-dialog';

let store, trans, category;

moduleForComponent('category-cost-section', 'Integration | Component | category-cost-section', {
  integration: true,
  beforeEach() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:category']);
    run(() => {
      category = store.push('category', { id: CD.idOne, cost_amount: CD.costAmountOne, cost_currency: CurrencyD.id,
        inherited: { cost_amount: { value: CD.costAmountOne } }
      });
      store.push('currency', { id: CurrencyD.id, symbol: CurrencyD.symbol, name: CurrencyD.name, decimal_digits: CurrencyD.decimal_digits,
        code: CurrencyD.code, name_plural: CurrencyD.name_plural, rounding: CurrencyD.rounding, symbol_native: CurrencyD.symbol_native });
    });
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('cost_amount inherited text should not show if there is a concrete value', function(assert) {
  this.model = category;
  this.render(hbs`{{categories/cost-section model=model}}`);
  assert.equal(page.costAmountValue, CD.costAmountOne);
  assert.equal(this.$('.t-inherited-msg-cost_amount').length, 0);
});

test('cost_amount validations', function(assert) {
  this.model = category;
  this.render(hbs`{{categories/cost-section model=model}}`);
  this.$('.t-amount').val('100').trigger('blur');
  assert.equal(this.$('.t-amount').val(), '100.00');
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  this.$('.t-amount').val('').trigger('input');
  return wait().then(() => {
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), trans.t('errors.category.cost_amount'));
  });
});

test('cost_amount inherited text should show if there is no concrete value', function(assert) {
  run(() => {
    category = store.push('category', { id: CD.idOne, cost_amount: null, inherited: { cost_amount: { value: null, inherited_from: 'category' } } });
  });
  this.model = category;
  this.render(hbs`{{categories/cost-section model=model}}`);
  assert.equal(page.costAmountValue, '');
  assert.equal(this.$('.t-inherited-msg-cost_amount').length, 1);
});

test('cost_amount validation error for negative number', function(assert) {
  this.model = category;
  const COST_AMOUNT = '.t-amount';
  this.render(hbs`{{categories/cost-section model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(COST_AMOUNT).val('-1').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.category.cost_amount.gte'));
    this.$(COST_AMOUNT).val('10').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});

test('cost_amount validation error for too lg number', function(assert) {
  this.model = category;
  const COST_AMOUNT = '.t-amount';
  this.render(hbs`{{categories/cost-section model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(COST_AMOUNT).val('999999999999999999999').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.category.cost_amount.length'));
    this.$(COST_AMOUNT).val('10').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});
