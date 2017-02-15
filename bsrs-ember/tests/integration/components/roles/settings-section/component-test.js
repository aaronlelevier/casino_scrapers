import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import hbs from 'htmlbars-inline-precompile';
import CD from 'bsrs-ember/vendor/defaults/currency';
import RD from 'bsrs-ember/vendor/defaults/role';
import wait from 'ember-test-helpers/wait';

const ERR_TEXT = '.validated-input-error-dialog';

var trans, store; 

moduleForComponent('roles/settings-section', 'Integration | Component | roles/settings section', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry, ['model:role', 'model:currency']);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('currency', { id: CD.id, symbol: CD.symbol, name: CD.name, decimal_digits: CD.decimal_digits, code: CD.code, name_plural: CD.name_plural,
        rounding: CD.rounding, symbol_native: CD.symbol_native, default: true, });
      this.model = store.push('role', { id: RD.idOne, dashboard_text: RD.dashboard_text, auth_amount: RD.auth_amount, auth_currency: RD.auth_currency });
    });
  }
});

test('it renders with currency and dashboard_text fields', function(assert) {
  this.render(hbs`{{roles/settings-section model=model}}`);
  assert.equal(this.$('.t-amount').val(), RD.auth_amount);
  assert.equal(this.$('.t-settings-dashboard_text').val(), RD.dashboard_text);
});

test('auth_amount validation error for negative number', function(assert) {
  const AUTH_AMOUNT = '.t-amount';
  this.render(hbs`{{roles/settings-section model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(AUTH_AMOUNT).val('-1').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.role.auth_amount.gte'));
    this.$(AUTH_AMOUNT).val('10').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});

test('auth_amount validation error for too lg number', function(assert) {
  const AUTH_AMOUNT = '.t-amount';
  this.render(hbs`{{roles/settings-section model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(AUTH_AMOUNT).val('999999999999999999999').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.role.auth_amount.length'));
    this.$(AUTH_AMOUNT).val('10').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});
