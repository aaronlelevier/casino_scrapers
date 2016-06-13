import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import translation from "bsrs-ember/instance-initializers/ember-i18n";
import translations from 'bsrs-ember/vendor/translation_fixtures';
import PD from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/currencies';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

const LONG_AUTH_AMOUNT = '50000.0000';

var container, registry, store, model, currencyObject, service, trans, run = Ember.run;

moduleForComponent('input-currency', 'integration: input-currency test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:person', 'model:currency', 'service:currency']);
    run(function() {
      store.push('person-current', {
        id: PD.id
      });
      currencyObject = store.push('currency', {
        id: CD.id,
        symbol: CD.symbol,
        name: CD.name,
        decimal_digits: CD.decimal_digits,
        code: CD.code,
        name_plural: CD.name_plural,
        rounding: CD.rounding,
        symbol_native: CD.symbol_native,
        default: true,
      });
    });
    translation.initialize(this);
    trans = this.container.lookup('service:i18n');
  }
});

test('renders a component with no value when bound attr is undefined', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: undefined,
      settings_object: PD.settings
    });
  });
  this.set('model', model);
  this.render(hbs `{{input-currency model=model field="auth_amount"}}`);
  var $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').val(), '');
});

test('renders a component with 0.00 when the field returns a truly zero value', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: CD.authAmountOne,
      auth_currency: CD.id,
      settings_object: PD.settings
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount" currencyObject=currencyObject}}`);
  var $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code').text().trim(), CD.code);
  // shows precision is adjusted based upon Currency record
  assert.equal($component.find('.t-amount').val(), parseFloat(CD.authAmountOne).toFixed(CD.decimal_digits));
});

test('if the person does not have a currency, use their inherited currency from the Role (in their settings obj)', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: 0,
      settings_object: PD.settings
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount" currencyObject=currencyObject}}`);
  var $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), '0.0000');
});

test('renders a component with currency and label', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: LONG_AUTH_AMOUNT,
      currency: CD.id,
      settings_object: PD.settings
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount" currencyObject=currencyObject}}`);
  var $component = this.$('.t-input-currency');
  $component.find('.t-amount').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), PD.auth_amount);
});

test('the models bound field will update both the formatted input value and the model itself', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
      auth_amount: LONG_AUTH_AMOUNT,
      currency: CD.id,
      settings_object: PD.settings
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount" currencyObject=currencyObject}}`);
  var $component = this.$('.t-input-currency');
  $component.find('.t-amount').val('30').trigger('blur');
  assert.equal($component.find('.t-currency-symbol').text().trim(), CD.symbol_native);
  assert.equal($component.find('.t-currency-code').text().trim(), CD.code);
  assert.equal($component.find('.t-amount').val(), '30.0000');
  $component.find('.t-amount').val('30').trigger('blur');
  assert.equal(model.get('auth_amount'), '30');
});

test('t-amount placeholder should be defaulted if is not passed into component', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount"}}`);
  var $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], trans.t('admin.amount_and_default_value'));
});

test('t-amount placeholder is not defaulted if is passed into component', function(assert) {
  run(function() {
    model = store.push('person', {
      id: PD.id,
    });
  });
  this.set('model', model);
  this.set('currencyObject', currencyObject);
  this.render(hbs `{{input-currency model=model field="auth_amount" placeholder="foo"}}`);
  var $component = this.$('.t-input-currency');
  assert.equal($component.find('.t-amount').get(0)['placeholder'], "foo");
});
