import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import translation from 'bsrs-ember/instance-initializers/ember-i18n';
import translations from 'bsrs-ember/vendor/translation_fixtures';
import loadTranslations from 'bsrs-ember/tests/helpers/translations';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
// import CD from 'bsrs-ember/vendor/defaults/category';
// import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import moment from 'moment';

const WD = WORK_ORDER_DEFAULTS.defaults();
let wo, store, trans;

moduleForComponent('work-orders/new/step-2', 'Integration | Component | work orders/new/step 2', {
  integration: true,
  setup() {
    trans = this.container.lookup('service:i18n');
    loadTranslations(trans, translations.generate('en'));
    translation.initialize(this);
    store = module_registry(this.container, this.registry);
    run(() => {
      wo = store.push('work-order', {id: WD.idOne, approved_amount: WD.approvedAmount});
    });
  }
});

test('can fill out approved_amount', function(assert) {
  this.model = wo;
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  this.$('.t-wo-approved_amount').val('23').trigger('change');
  assert.equal(wo.get('approved_amount'), '23');
});

test('can fill out scheduled_date', function(assert) {
  const expectedDate = new Date();
  this.model = wo;
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  assert.equal(this.$('.t-scheduled-date').length, 1);
  let interactor = openDatepicker(this.$('.t-scheduled-date'));
  interactor.selectDate(expectedDate);
  assert.equal(this.$('.t-scheduled-date').val(), moment().format('L'));
});

test('can fill out instructions with optional flag', function(assert) {
  this.model = wo;
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  this.$('.t-wo-instructions').val(WD.instructions).trigger('change');
  assert.equal(wo.get('instructions'), WD.instructions);
  assert.equal(this.$('.t-wo-instructions').val(), WD.instructions);
  assert.equal(this.$('[data-test-id="instructions"]').text().trim(), `${trans.t('work_order.label.instructions')}optional`);
});

test('auth_amount should be defaulted and placeholder value should not be bound to model', function(assert) {
  this.model = wo;
  this.render(hbs`{{work-orders/new/step-2 model=model}}`);
  assert.equal($('.t-wo-approved_amount').val(), WD.approvedAmount);
  assert.equal($('.t-wo-approved_amount').attr('placeholder'), `${trans.t('crud.default_value', { value: WD.approvedAmount })}`);
  this.$('.t-wo-approved_amount').val('23').trigger('change');
  assert.equal($('.t-wo-approved_amount').attr('placeholder'), `${trans.t('crud.default_value', { value: WD.approvedAmount })}`);
});
