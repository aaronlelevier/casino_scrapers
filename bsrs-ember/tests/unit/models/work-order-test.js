import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import WORK_ORDER from 'bsrs-ember/vendor/defaults/work-order';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';

let workOrder, inactive_currency;

const WD = WORK_ORDER.defaults();
const WOSD = WORK_ORDER_STATUSES.defaults();

moduleFor('model:work-order', 'Unit | Model | work-order', {
  needs: ['model:currency', 'model:work-order-status'],
  beforeEach() {
    this.store = module_registry(this.container, this.registry);
    run(() => {
      workOrder = this.store.push('work-order', { id: WD.idOne });
    });
  },
  afterEach() {
    delete this.store;
  }
});

test('dirty test | scheduled_date', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('scheduled_date', WD.scheduledDateOne);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('scheduled_date', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | completed_date', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('completed_date', WD.completedDateOne);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('completed_date', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | expiration_date', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('expiration_date', WD.expirationDateOne);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('expiration_date', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | approval_date', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('approval_date', WD.approvalDateOne);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('approval_date', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | approved_amount', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('approved_amount', 10.33);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('approved_amount', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | cost_estimate', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('cost_estimate', 10.33);
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('cost_estimate', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_name', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_name', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_name', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_logo', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_logo', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_logo', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_address1', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_address1', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_address1', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_address2', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_address2', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_address2', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_city', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_city', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_city', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_state', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_state', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_state', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_postal_code', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_postal_code', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_postal_code', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_phone', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_phone', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_phone', '');
  assert.equal(workOrder.get('isDirty'), false);
});

test('dirty test | provider_email', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('provider_email', 'wat');
  assert.equal(workOrder.get('isDirty'), true);
  workOrder.set('provider_email', '');
  assert.equal(workOrder.get('isDirty'), false);
});

/* Cost Estimate currency */
test('related currency should return one currency for a work-order', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, cost_estimate_currency_fk: CurrencyD.idOne});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('cost_estimate_currency').get('id'), CurrencyD.idOne);
});

test('change_cost_estimate_currency - will update the currencys currency and dirty the model', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, cost_estimate_currency_fk: undefined});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: []});
    inactive_currency = this.store.push('currency', {id: CurrencyD.idTwo, workOrders: []});
  });
  assert.equal(workOrder.get('cost_estimate_currency'), undefined);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(workOrder.get('costEstimateCurrencyIsNotDirty'));
  workOrder.change_cost_estimate_currency({id: CurrencyD.idOne});
  assert.equal(workOrder.get('cost_estimate_currency_fk'), undefined);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idOne);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('costEstimateCurrencyIsDirty'));
});

test('saveCostEstimateCurrency - currency - workOrder will set cost_estimate_currency_fk to current currency id', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, cost_estimate_currency_fk: CurrencyD.idOne});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    inactive_currency = this.store.push('currency', {id: CurrencyD.idTwo, workOrders: []});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idOne);
  workOrder.change_cost_estimate_currency({id: inactive_currency.get('id')});
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('costEstimateCurrencyIsDirty'));
  workOrder.saveRelated();
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!workOrder.get('costEstimateCurrencyIsDirty'));
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idTwo);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idTwo);
});

test('rollbackCostEstimateCurrency - currency - workOrder will set currency to current cost_estimate_currency_fk', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, cost_estimate_currency_fk: CurrencyD.idOne});
    this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idOne);
  workOrder.change_cost_estimate_currency({ id: CurrencyD.idTwo });
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('costEstimateCurrencyIsDirty'));
  workOrder.rollback();
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!workOrder.get('costEstimateCurrencyIsDirty'));
  assert.equal(workOrder.get('cost_estimate_currency.id'), CurrencyD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CurrencyD.idOne);
});

test('workOrder has a related work order status', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, status_fk: WOSD.idOne});
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.equal(workOrder.get('status.name'), WOSD.nameOne);
});

test('change_status and dirty tracking', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, status_fk: WOSD.idOne});
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(workOrder.get('statusIsNotDirty'));
  workOrder.change_status({id: WOSD.idTwo});
  assert.equal(workOrder.get('status').get('id'), WOSD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('statusIsDirty'));
});

test('rollback status will revert and reboot the dirty type to clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, status_fk: WOSD.idOne});
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_status({id: WOSD.idTwo});
  assert.equal(workOrder.get('status').get('id'), WOSD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.rollback();
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated workOrder status to save model and make it clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, status_fk: WOSD.idOne});
    this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_status({id: WOSD.idTwo});
  assert.equal(workOrder.get('status').get('id'), WOSD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.saveRelated();
  assert.equal(workOrder.get('status').get('id'), WOSD.idTwo);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});
