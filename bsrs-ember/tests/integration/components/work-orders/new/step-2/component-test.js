import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';

const ERR_TEXT = '.validated-input-error-dialog';
let wo, store, trans, WD;

moduleForComponent('work-orders/new/step-2', 'Integration | Component | work orders/new/step 2', {
  integration: true,
  setup() {
    WD = WORK_ORDER_DEFAULTS.defaults();
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry);
    run(() => {
      wo = store.push('work-order', { id: WD.idOne, approved_amount: WD.approvedAmount, 
        cost_estimate_currency: CurrencyD.idOne });
      store.push('currency', { id: CurrencyD.idOne, decimal_digits: 2 });
    });
    this.model = wo;
  }
});

test('can fill out approved_amount', function(assert) {
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  this.$('.t-wo-approved_amount').val('23').trigger('blur');
  assert.equal(wo.get('approved_amount'), '23');
});

test('can fill out scheduled_date', function(assert) {
  const expectedDate = new Date();
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  assert.equal(this.$('.t-scheduled-date').length, 1);
  let interactor = openDatepicker(this.$('.t-scheduled-date'));
  interactor.selectDate(expectedDate);
  assert.equal(this.$('.t-scheduled-date').val(), moment().format('L'));
});

test('can fill out instructions with optional flag', function(assert) {
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  this.$('.t-wo-instructions').val(WD.instructions).trigger('change');
  assert.equal(wo.get('instructions'), WD.instructions);
  assert.equal(this.$('.t-wo-instructions').val(), WD.instructions);
  assert.equal(this.$('[data-test-id="instructions"]').text().trim(), `${trans.t('work_order.label.instructions')}optional`);
});

test('approved_amount should be defaulted and placeholder value should not be bound to model', function(assert) {
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  assert.equal($('.t-wo-approved_amount').val(), WD.approvedAmount);
  assert.equal($('.t-wo-approved_amount').attr('placeholder'), `${trans.t('crud.default_value', { value: WD.approvedAmount })}`);
  this.$('.t-wo-approved_amount').val('23').trigger('blur');
  assert.equal($('.t-wo-approved_amount').attr('placeholder'), `${trans.t('crud.default_value', { value: WD.approvedAmount })}`);
});

test('approved_amount validation error for negative number', function(assert) {
  const APPROVED_AMOUNT = '.t-amount';
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(APPROVED_AMOUNT).val('-1').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.work_order.approved_amount.gte'));
    this.$(APPROVED_AMOUNT).val('0').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});

test('approved_amount validation error for too lg number', function(assert) {
  const APPROVED_AMOUNT = '.t-amount';
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  // presence required
  assert.equal($(ERR_TEXT).text().trim(), '');
  this.$(APPROVED_AMOUNT).val('999999999999999999999').trigger('input');
  return wait().then(() => {
    // invalid input
    assert.ok(this.$('.invalid').is(':visible'));
    assert.equal($(ERR_TEXT).text().trim(), trans.t('errors.work_order.approved_amount.length'));
    this.$(APPROVED_AMOUNT).val('0').trigger('input');
    return wait().then(() => {
      // valid input
      assert.notOk(this.$('.invalid').is(':visible'));
      assert.equal($(ERR_TEXT).text().trim(), '');
    });
  });
});
