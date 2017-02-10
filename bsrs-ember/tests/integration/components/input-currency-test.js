import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import RD from 'bsrs-ember/vendor/defaults/role';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CatD from 'bsrs-ember/vendor/defaults/category';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import page from 'bsrs-ember/tests/pages/input-currency';
import waitFor from 'ember-test-helpers/wait';
import formatNumber from 'accounting/format-number';

const LONG_AUTH_AMOUNT = '50000.0000';
const PD = PERSON_DEFAULTS.defaults();

let store, model, trans, run = Ember.run;

moduleForComponent('input-currency', 'integration: input-currency test', {
  integration: true,
  setup() {
    page.setContext(this);
    store = module_registry(this.container, this.registry, ['model:person', 'model:currency', 'service:currency']);
    run(function() {
      store.push('person-current', {
        id: PD.id
      });
      store.push('currency', { id: CD.id, symbol: CD.symbol, name: CD.name, decimal_digits: CD.decimal_digits,
        code: CD.code, name_plural: CD.name_plural, rounding: CD.rounding, symbol_native: CD.symbol_native, default: true,
      });
    });
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
  },
  afterEach() {
    page.removeContext(this);
  }
});

test('person detail example setup', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: CD.authAmountOne,
      auth_currency: CD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency'
                placeholder=(t 'crud.default_value' value=model.inherited.auth_amount.inherited_value)
                inheritsFrom=model.inherited.auth_amount.inherits_from
              }}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  // shows precision is adjusted based upon Currency record
  assert.equal($component.find('.t-amount').val(), parseFloat(CD.authAmountOne).toFixed(CD.decimal_digits));
  // default to inherited value placeholder if blank
  page.authAmountFillin('');
  assert.equal($component.find('.t-amount').val(), '');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], trans.t('crud.default_value'));
});

test('role example setup', function(assert) {
  run(function() {
    model = store.push('role', {
      id: RD.id,
      new: true
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' }}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  // default to inherited value placeholder if blank
  page.authAmountFillin('');
  assert.equal($component.find('.t-amount').val(), '');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
});

test('category example setup', function(assert) {
  run(function() {
    model = store.push('category', {
      id: CatD.id,
      cost_amount: CD.authAmountOne,
      cost_currency: CD.id
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='cost_amount' currencyField='cost_currency'}}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), parseFloat(CD.authAmountOne).toFixed(CD.decimal_digits));
  // default to inherited value placeholder if blank
  page.authAmountFillin('');
  assert.equal($component.find('.t-amount').val(), '');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
});

test('renders a component with no value when bound attr is undefined', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: undefined,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' inheritsFrom=model.inherited.auth_amount.inherits_from}}`);
  let $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').val(), '');
});

test('if the person does not have a currency, use their inherited currency from the Role (in their settings obj)', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: 0,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency 
    model=model 
    field='auth_amount' 
    currencyField='auth_currency' 
    inheritsFrom=model.inherited.auth_amount.inherits_from}}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), '0.00');
  // clear amount, and show placeholder
  page.authAmountFillin('');
  assert.equal($component.find('.t-amount').val(), '');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
  this.$('.t-amount').val('').trigger('keyup').trigger('focusout');
  return waitFor().then(() => {
    assert.equal(this.$('.t-amount').val(), '');
    assert.equal(model.get('auth_amount'), null, 'input sets to null');
    assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
    this.$('.t-amount').val(0).trigger('keyup').trigger('focusout');
    return waitFor().then(() => {
      assert.equal($component.find('.t-amount').val(), '0.00');
      assert.equal(model.get('auth_amount'), 0, 'input sets to 0 and not to null');
      assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
    });
  });
});

test('renders a component with currency and label', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: LONG_AUTH_AMOUNT,
      currency: CD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' inheritsFrom=model.inherited.auth_amount.inherits_from}}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), formatNumber(PD.auth_amount, CD.decimal_digits));
});

test('the models bound field will update both the formatted input value and the model itself', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: LONG_AUTH_AMOUNT,
      currency: CD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' inheritsFrom=model.inherited.auth_amount.inherits_from}}`);
  let $component = this.$('.t-input-currency');
  $component.find('.t-amount').val('30').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code-select').text().trim(), CD.code);
  // assert.equal($component.find('.t-amount').val(), parseFloat('30.0000').toFixed(CD.decimal_digits));
  $component.find('.t-amount').val('30').trigger('blur');
  assert.equal(model.get('auth_amount'), '30.00');
});

test('t-amount placeholder should be defaulted if is not passed into component', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' inheritsFrom=model.inherited.auth_amount.inherits_from}}`);
  let $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], '0.00');
});

test('t-amount placeholder is not defaulted if is passed into component', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field='auth_amount' currencyField='auth_currency' inheritsFrom=model.inherited.auth_amount.inherits_from placeholder='foo'}}`);
  let $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], 'foo');
});
test('testing edge cases. ex: chars A-Z, negative numbers, commas & decimals', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model
    field='auth_amount'
    currencyField='auth_currency'
    inheritsFrom=model.inherited.auth_amount.inherits_from
    placeholder='foo'
  }}`);
  let $component = this.$('.t-input-currency');
  // formats negative numbers to positive & all instances of - get cleared out
  this.$('.t-amount').val('-1.00-').trigger('keyup');
  return waitFor().then(() => {
    assert.equal(this.$('.t-amount').val(), '1.00');
    // will not accept characters A-Z
    this.$('.t-amount').val('wat').trigger('keyup');
    return waitFor().then(() => {
      assert.equal(this.$('.t-amount').val(), '');
      //will accept decimals and commoas
      this.$('.t-amount').val('1,000.00').trigger('keyup');
      return waitFor().then(() => {
        assert.equal(this.$('.t-amount').val(), '1,000.00');
      });
    });
  });
});
