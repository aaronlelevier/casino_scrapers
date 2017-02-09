import Ember from 'ember';
const { run, set } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import moment from 'moment';
import { openDatepicker } from 'ember-pikaday/helpers/pikaday';
import testSelector from 'ember-test-selectors';

let WD, WOSD, ProviderD, PD, store, model, model2, trans;
const PC = PERSON_CURRENT.defaults();

moduleForComponent('ticket-display-expanded', 'integration: ticket-display-expanded test', {
  integration: true,
  setup() {

    WD = WORK_ORDER_DEFAULTS.defaults();
    WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();
    ProviderD = PROVIDER_DEFAULTS.defaults();
    PD = PERSON_DEFAULTS.defaults();

    trans = this.container.lookup('service:i18n');
    store = module_registry(this.container, this.registry);

    run(() => {
      store.push('person-current', PERSON_CURRENT.defaults());
      store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
      store.push('person', { id: PD.idOne, fullname: PD.fullnume, workOrders: [WD.idOne] });
      model = store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne,
        scheduled_date: WD.scheduledDateOne, cost_estimate_currency: CurrencyD.idOne,
        status_fk: WOSD.idOne, provider_fk: ProviderD.idOne, approved_amount: WD.approvedAmount,
        approval_date: WD.approvalDateOne, approver_fk: PD.idOne, gl_code: WD.glCodeOne,
        instructions: WD.instructions
      });
      store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne,
        address1: ProviderD.address1One, logo: ProviderD.logoOne,
        workOrders: [WD.idOne]});
      store.push('currency', {id: CurrencyD.idOne, symbol: CurrencyD.symbol,
        code: CurrencyD.code, cost_estimate: CurrencyD.costEstimateOne, workOrders: [WD.idOne]});
    });
  },
});

test('displays provider logo, full address, phone and email', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  let provider = store.find('provider', ProviderD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0"}}`);

  const logo1 = this.$('[data-test-id="provider-logo0"]').css('background-image');
  assert.equal(logo1.replace(/\"/g, ''), `url(${model.get('provider.logo')})`);
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.address1'));
  //address1 and city only
  run(()=>{
    provider.set('city', ProviderD.cityOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.address1') + ' ' + model.get('provider.city'));
  //address 1 and state only
  run(()=>{
    provider.set('city', '');
    provider.set('state', ProviderD.stateOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.address1') + ' ' + model.get('provider.state'));
  //address 1, city and state
  run(()=>{
    provider.set('city', ProviderD.cityOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.address1') + ' ' + model.get('provider.city') + ', ' + model.get('provider.state'));
  //email only
  run(()=>{
    provider.set('postal_code', ProviderD.postalCodeOne);
    provider.set('phone', ProviderD.phoneOne);
    provider.set('email', ProviderD.emailOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.address1') + ' ' + model.get('provider.city') + ', ' + model.get('provider.state') + ' ' + model.get('provider.postal_code') + ' • ' + model.get('provider.phone') + ' • ' + model.get('provider.email'));

});


test('displays cost, gl, instructions, scheduled date and tracking number', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0" currencyField="cost_estimate_currency" field="cost_estimate"}}`);

  //TODO: Currency helper is removing the decimal places from default currency amount
  this.$('[data-test-id="wo-fg-cost0"] .t-amount').val('');
  assert.equal(this.$('[data-test-id="wo-fg-cost0"] .t-amount').val(), '');
  this.$('[data-test-id="wo-fg-cost0"] .t-amount').val(WD.costEstimateOne);
  assert.equal(this.$('[data-test-id="wo-fg-cost0"] .t-amount').val(), WD.costEstimateOne);
  
  this.$('.t-wo-gl_code0').val('');
  assert.equal(this.$('.t-wo-gl_code0').val(), '');
  this.$('.t-wo-gl_code0').val(WD.glCodeOne);
  assert.equal(this.$('.t-wo-gl_code0').val(), WD.glCodeOne);

  this.$('[data-test-id="wo-fg-instructions0"] .t-instructions').val('');
  assert.equal(this.$('[data-test-id="wo-fg-instructions0"] .t-instructions').val(), '');
  this.$('[data-test-id="wo-fg-instructions0"] .t-instructions').val(WD.instructions);
  assert.equal(this.$('[data-test-id="wo-fg-instructions0"] .t-instructions').val(), WD.instructions);

  //TODO: Determine what to do about data/time strings
  //TODO: Pick-a-day has a hard coded date format - not good for i18n
  //assert.equal(this.$('[data-test-id="wo-fg-scheduled_date0"] .t-scheduled-date').val(), WD.scheduledDateOne);

  //No tracking number at first
  assert.equal(this.$('[data-test-id="wo-tracking0"]').text().trim(), trans.t('work_order.label.tracking_tbd'));
});

test('approval text displays properly', function(assert) {
  let approvalPhrase = `cost="${WD.approvedAmount}" approver="${PD.fullname}" approvedDate="${WD.approvalDateOne}" currency="${CurrencyD.code}" currencySymbol="${CurrencyD.symbol}"`;
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0"}}`);
  //starts out with an approval
  assert.equal(this.$('[data-test-id="work-order-approved0"]').text().trim(), trans.t('work_order.phrase.approval'));
  //remove approval
  run(() => {
    this.model.set('approved_amount', '');
  });
  assert.equal(this.$('[data-test-id="work-order-not-approved0"]').text().trim(), trans.t('work_order.phrase.not_approved'));

});

test('all timeline items are displayed', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0"}}`);

  assert.equal(this.$('[data-test-id*="timeline-item"]').length, 6);
  assert.equal(this.$('[data-test-id*="timeline-btn"]').length, 6);

});

test('labels are translated', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0"}}`);
  assert.equal(this.$('[data-test-id="work-order-title-cost0"]').text().trim(), trans.t('work_order.title.cost'));
  assert.equal(this.$('[data-test-id="work-order-title-instructions0"]').text().trim(), trans.t('work_order.title.instructions'));
  assert.equal(this.$('[data-test-id="work-order-title-schedule0"]').text().trim(), trans.t('work_order.title.schedule'));
  assert.equal(this.$('[data-test-id="wo-fg-cost0"] label').text().trim(), trans.t('work_order.label.cost_estimate'));
  assert.equal(this.$('[data-test-id="wo-fg-scheduled_date0"] label').text().trim(), trans.t('work_order.label.scheduled_date'));
  assert.equal(this.$('[data-test-id="wo-fg-tracking_number0"] label').text().trim(), trans.t('work_order.label.tracking_number'));
});

test('can reschedule scheduled_date', function(assert) {
  run(() => {
    set(this, 'permissions', ['view_workorder', 'change_workorder']);
  });
  const tomorrow = moment().add(1, 'day').format('L');
  const expectedDate = new Date(tomorrow);
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded permissions=permissions model=model indx="0"}}`);
  let selector = '[data-test-id="scheduled-date"]';
  assert.equal(this.$(selector).length, 0, 'reschedule must be clicked first');
  let actual = this.$(testSelector('id', 'wo-fg-scheduled_date0')).find('input[readonly]').val();
  assert.ok(actual, 'a scheduled date is present');
  assert.notEqual(actual, tomorrow, 'tomorrow is not scheduled');
  this.$(testSelector('id', 'begin-reschedule')).click();
  this.$(selector).click();
  let interactor = openDatepicker(this.$(selector + ' input'));
  interactor.selectDate(expectedDate);
  actual = this.$(selector + ' input').val();
  assert.equal(actual, tomorrow, 'tomorrow was selected');
});

test('can cancel reschedule', function(assert) {
  run(() => {
    set(this, 'permissions', ['view_workorder', 'change_workorder']);
  });
  const tomorrow = moment().add(1, 'day').format('L');
  const expectedDate = new Date(tomorrow);
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model permissions=permissions indx="0"}}`);
  let selector = '[data-test-id="scheduled-date"]';
  let actual = this.$(testSelector('id', 'wo-fg-scheduled_date0')).find('input[readonly]').val();
  let expected = moment(WD.scheduledDateOne).format('MM/DD/YYYY');
  assert.equal(actual, expected, `Date is ${expected}` );
  this.$(testSelector('id', 'begin-reschedule')).click();
  this.$(selector).click();
  let interactor = openDatepicker(this.$(selector + ' input'));
  interactor.selectDate(expectedDate);
  actual = this.$(selector + ' input').val();
  assert.equal(actual, tomorrow, 'tomorrow was selected');
  this.$(testSelector('id', 'cancel-reschedule')).click();
  actual = this.$(testSelector('id', 'wo-fg-scheduled_date0')).find('input[readonly]').val();
  assert.equal(actual, expected, `Date is ${expected}` );
});

test('if work order has tracking number display it otherwise show TBD', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-expanded model=model indx="0"}}`);
  assert.equal(this.$('[data-test-id="wo-tracking0"]').text().trim(), trans.t('work_order.label.tracking_tbd'));
  run(() => {
    store.push('work-order', {id: WD.idOne, tracking_number: WD.trackingNumberOne}); 
  });
  assert.equal(this.$('[data-test-id="wo-tracking0"]').text().trim(), WD.trackingNumberOne);
});

