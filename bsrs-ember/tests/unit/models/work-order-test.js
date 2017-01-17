import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import WORK_ORDER from 'bsrs-ember/vendor/defaults/work-order';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PROVIDER from 'bsrs-ember/vendor/defaults/provider';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CD from 'bsrs-ember/vendor/defaults/category';

let workOrder, inactive_currency;

const WD = WORK_ORDER.defaults();
const WOSD = WORK_ORDER_STATUSES.defaults();
const PRD = PROVIDER.defaults();
const PD = PERSON_DEFAULTS.defaults();
// const PC = PERSON_CURRENT.defaults();

moduleFor('model:work-order', 'Unit | Model | work-order terrance', {
  needs: ['model:currency','service:translations-fetcher','service:i18n', 'model:uuid', 
    'model:status','validator:presence', 'validator:unique-username', 'validator:length',
    'validator:format', 'validator:has-many', 'model:person', 'service:person-current',
    'model:work-order-status', 'model:category', 'model:provider' ,'service:i18n','validator:presence'],
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

test('workOrder has a related work order category', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, category_fk: CD.idOne});
    this.store.push('category', {id: CD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('category').get('id'), CD.idOne);
  assert.equal(workOrder.get('category.name'), CD.nameOne);
});

test('change_category and dirty tracking', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, category_fk: CD.idOne});
    this.store.push('category', {id: CD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(workOrder.get('categoryIsNotDirty'));
  workOrder.change_category({id: CD.idTwo});
  assert.equal(workOrder.get('category').get('id'), CD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('categoryIsDirty'));
});

test('rollback category will revert and reboot the dirty type to clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, category_fk: CD.idOne});
    this.store.push('category', {id: CD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('category').get('id'), CD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_category({id: CD.idTwo});
  assert.equal(workOrder.get('category').get('id'), CD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.rollback();
  assert.equal(workOrder.get('category').get('id'), CD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated workOrder category to save model and make it clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, category_fk: CD.idOne});
    this.store.push('category', {id: CD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('category').get('id'), CD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_category({id: CD.idTwo});
  assert.equal(workOrder.get('category').get('id'), CD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.saveRelated();
  assert.equal(workOrder.get('category').get('id'), CD.idTwo);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

// Provider
test('workOrder has a related work order category', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, provider_fk: PRD.idOne});
    this.store.push('provider', {id: PRD.idOne, name: PRD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('provider').get('id'), PRD.idOne);
  assert.equal(workOrder.get('provider.name'), PRD.nameOne);
});

test('change_provider and dirty tracking', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, provider_fk: PRD.idOne});
    this.store.push('provider', {id: PRD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(workOrder.get('providerIsNotDirty'));
  workOrder.change_provider({id: PRD.idTwo});
  assert.equal(workOrder.get('provider').get('id'), PRD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('providerIsDirty'));
});

test('rollback provider will revert and reboot the dirty type to clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, provider_fk: PRD.idOne});
    this.store.push('provider', {id: PRD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('provider').get('id'), PRD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_provider({id: PRD.idTwo});
  assert.equal(workOrder.get('provider').get('id'), PRD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.rollback();
  assert.equal(workOrder.get('provider').get('id'), PRD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated workOrder provider to save model and make it clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, provider_fk: PRD.idOne});
    this.store.push('provider', {id: PRD.idOne, name: CD.nameOne, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('provider').get('id'), PRD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_provider({id: PRD.idTwo});
  assert.equal(workOrder.get('provider').get('id'), PRD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.saveRelated();
  assert.equal(workOrder.get('provider').get('id'), PRD.idTwo);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('workOrder has a related work order approver', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, approver_fk: PD.idOne});
    this.store.push('person', {id: PD.idOne, name: PD.fullname, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.equal(workOrder.get('approver.name'), PD.fullname);
});

test('change_approver and dirty tracking', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, approver_fk: PD.idOne});
    this.store.push('person', {id: PD.idOne, name: PD.fullname, workOrders: [WD.idOne]});
  });
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(workOrder.get('approverIsNotDirty'));
  workOrder.change_approver({id: PD.idTwo});
  assert.equal(workOrder.get('approver').get('id'), PD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  assert.ok(workOrder.get('approverIsDirty'));
});

test('rollback approver will revert and reboot the dirty type to clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, approver_fk: PD.idOne});
    this.store.push('person', {id: PD.idOne, name: PD.fullname, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_approver({id: PD.idTwo});
  assert.equal(workOrder.get('approver').get('id'), PD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.rollback();
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated workOrder approver to save model and make it clean', function(assert) {
  run(() => {
    workOrder = this.store.push('work-order', {id: WD.idOne, approver_fk: PD.idOne});
    this.store.push('person', {id: PD.idOne, name: PD.fullname, workOrders: [WD.idOne]});
  });
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
  workOrder.change_approver({id: PD.idTwo});
  assert.equal(workOrder.get('approver').get('id'), PD.idTwo);
  assert.ok(workOrder.get('isDirtyOrRelatedDirty'));
  workOrder.saveRelated();
  assert.equal(workOrder.get('approver').get('id'), PD.idTwo);
  assert.ok(workOrder.get('isNotDirtyOrRelatedNotDirty'));
});

test('serialize', function(assert) {
  run(() => {
      this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      workOrder = this.store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, approved_amount: WD.approvedAmount, 
        scheduled_date: WD.scheduledDateOne, approval_date: WD.approvalDateOne, expiration_date: WD.expirationDateOne, cost_estimate_currency_fk: CurrencyD.idOne, 
        status_fk: WOSD.idOne, provider_fk: PRD.idOne, category_fk: CD.idOne });
      this.store.push('provider', {id: PRD.idOne, name: PRD.nameOne, address1: PRD.address1One, logo: PRD.logoOne, workOrders: [WD.idOne]});
      this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
      this.store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, workOrders: [WD.idOne] });
  });
  let ret = workOrder.serialize();
  assert.equal(ret.id, WD.idOne);
  assert.equal(ret.cost_estimate, WD.costEstimateOne);
  assert.equal(ret.approved_amount, WD.approvedAmount);
  assert.equal(ret.scheduled_date, WD.scheduledDateOne);
  assert.deepEqual(ret.approval_date, WD.scheduledDateOne);
  assert.deepEqual(ret.expiration_date, WD.scheduledDateOne);
  assert.equal(ret.status, WOSD.idOne);
  assert.equal(ret.category, CD.idOne);
  assert.equal(ret.provider, PRD.idOne);
});

