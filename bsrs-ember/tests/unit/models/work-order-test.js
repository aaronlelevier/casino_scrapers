import Ember from 'ember';
const { run } = Ember;
import moment from 'moment';
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import WORK_ORDER from 'bsrs-ember/vendor/defaults/work-order';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import PROVIDER from 'bsrs-ember/vendor/defaults/provider';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CD from 'bsrs-ember/vendor/defaults/category';
import TD from 'bsrs-ember/vendor/defaults/ticket';

let workOrder, WD, WOSD, PRD, PD;

function setDefaults() {
  WD = WORK_ORDER.defaults();
  WOSD = WORK_ORDER_STATUSES.defaults();
  PRD = PROVIDER.defaults();
  PD = PERSON_DEFAULTS.defaults();
}

moduleFor('model:work-order', 'Unit | Model | work-order', {
  needs: ['model:currency','service:translations-fetcher','service:i18n', 'model:uuid',
    'model:status','validator:presence', 'validator:unique-username', 'validator:length',
    'validator:format', 'validator:number', 'validator:has-many', 'validator:presence', 'validator:date',
    'model:person', 'service:person-current', 'model:work-order-status', 'model:category',
    'model:provider'],
  beforeEach() {
    setDefaults();
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

test('dirty test | cost_estimate_currency', function(assert) {
  assert.equal(workOrder.get('isDirty'), false);
  workOrder.set('cost_estimate_currency', 10.33);
  assert.equal(workOrder.get('isDirty'), true);
});

test('model isReadOnly based on service', function(assert) {
  const stub = Ember.Service.create({isReadOnlyWorkorder: true});
  const workOrder  = this.subject({personCurrent: stub});
  assert.ok(workOrder.get('isReadOnly'), true);
  stub.set('isReadOnlyWorkoder', false);
  assert.ok(workOrder.get('isReadOnly'), false);
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
  function createWorkOrder() {
    let workOrder =  this.store.push('work-order', { 
      id: WD.idOne, cost_estimate: WD.costEstimateOne, approved_amount: WD.approvedAmount,
      scheduled_date: WD.scheduledDateOne, approval_date: WD.approvalDateOne, expiration_date: WD.expirationDateOne, cost_estimate_currency: CurrencyD.idOne,
      status_fk: WOSD.idOne, provider_fk: PRD.idOne, category_fk: CD.idOne, approver_fk: PD.idOne, gl_code: WD.glCodeOne, completed_date: WD.completedDateOne,
      instructions: WD.instructions, ticket: TD.idOne
    });
    workOrder.save();
    return workOrder;
  }
  run(() => {
      this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      workOrder = createWorkOrder.call(this);
      this.store.push('provider', {id: PRD.idOne, name: PRD.nameOne, address1: PRD.address1One, logo: PRD.logoOne, workOrders: [WD.idOne]});
      this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
      this.store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, workOrders: [WD.idOne] });
      this.store.push('person', { id: PD.idOne, fullname: PD.fullname, workOrders: [WD.idOne] });
  });
  let ret = workOrder.serialize();
  assert.equal(ret.id, WD.idOne);
  assert.equal(ret.cost_estimate, WD.costEstimateOne);
  assert.equal(ret.approved_amount, WD.approvedAmount);
  assert.equal(ret.scheduled_date, WD.scheduledDateOne);
  assert.deepEqual(ret.approval_date, WD.scheduledDateOne);
  assert.deepEqual(ret.expiration_date, WD.scheduledDateOne);
  assert.deepEqual(ret.completed_date, WD.completedDateOne);
  assert.equal(ret.gl_code, WD.glCodeOne);
  assert.equal(ret.instructions, WD.instructions);
  assert.equal(ret.status, WOSD.idOne);
  assert.equal(ret.category, CD.idOne);
  assert.equal(ret.provider, PRD.idOne);
  assert.equal(ret.approver, PD.idOne);
  assert.equal(ret.cost_estimate_currency, CurrencyD.idOne);
  assert.equal(ret.ticket, TD.idOne);
});

test('postSerialize', function(assert) {
  run(() => {
      this.store.push('work-order-status', { id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo] });
      workOrder = this.store.push('work-order', { id: WD.idOne, approved_amount: '1,200.012', scheduled_date: WD.scheduledDateOne, 
        cost_estimate_currency: CurrencyD.idOne, provider_fk: PRD.idOne, category_fk: CD.idOne, gl_code: WD.glCodeOne, 
        completed_date: WD.completedDateOne, instructions: WD.instructions, ticket: TD.idOne });
      this.store.push('provider', {id: PRD.idOne, name: PRD.nameOne, address1: PRD.address1One, logo: PRD.logoOne, workOrders: [WD.idOne]});
      this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
      this.store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, workOrders: [WD.idOne] });
      this.store.push('person', { id: PD.idOne, fullname: PD.fullname, workOrders: [WD.idOne] });
  });
  let ret = workOrder.postSerialize();
  assert.equal(ret.id, WD.idOne);
  assert.equal(ret.approved_amount, '1200.012', 'approved_amount serialized correctly');
  assert.equal(ret.scheduled_date, WD.scheduledDateOne);
  assert.equal(ret.gl_code, WD.glCodeOne);
  assert.equal(ret.instructions, WD.instructions);
  assert.equal(ret.category, CD.idOne);
  assert.equal(ret.provider, PRD.idOne);
  assert.equal(ret.cost_estimate_currency, CurrencyD.idOne);
  assert.equal(ret.ticket, TD.idOne);
  assert.notOk(ret.approval_date);
  assert.notOk(ret.completed_date);
  assert.notOk(ret.cost_estimate);
  assert.notOk(ret.status);
});

test('serialize will format numbers with commas', function(assert) {
  run(() => {
      this.store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      workOrder = this.store.push('work-order', { id: WD.idOne, cost_estimate: '1,200.010', approved_amount: '1,200.012',
        scheduled_date: WD.scheduledDateOne, approval_date: WD.approvalDateOne, expiration_date: WD.expirationDateOne, cost_estimate_currency: CurrencyD.idOne,
        status_fk: WOSD.idOne, provider_fk: PRD.idOne, category_fk: CD.idOne, approver_fk: PD.idOne, gl_code: WD.glCodeOne, completed_date: WD.completedDateOne,
        instructions: WD.instructions, ticket: TD.idOne});
      this.store.push('provider', {id: PRD.idOne, name: PRD.nameOne, address1: PRD.address1One, logo: PRD.logoOne, workOrders: [WD.idOne]});
      this.store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
      this.store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, workOrders: [WD.idOne] });
      this.store.push('person', { id: PD.idOne, fullname: PD.fullname, workOrders: [WD.idOne] });
  });
  assert.equal(workOrder.get('cost_estimate'), '1,200.010');
  assert.equal(workOrder.get('approved_amount'), '1,200.012');
  let ret = workOrder.serialize();
  assert.equal(ret.id, WD.idOne);
  assert.equal(ret.cost_estimate, '1200.010');
  assert.equal(ret.approved_amount, '1200.012');
});

test('scheduled_date validation', function(assert) {
  // Assertions for presence of date value
  workOrder.set('scheduled_date', '');
  let errors = workOrder.get('validations.attrs.scheduled_date.errors');
  let actual = errors[0].message;
  let expected = 'errors.work_order.scheduled_date';
  assert.equal(actual, expected, 'presence is required for a valid date.');

  // Assertions for date value, on or after today
  let yesterday = moment().subtract(1, 'days').format('MM/DD/YYYY');
  workOrder.set('scheduled_date', new Date(yesterday));
  errors = workOrder.get('validations.attrs.scheduled_date.errors');
  actual = errors[0].message;
  expected = 'errors.work_order.scheduled_date_in_past';
  assert.equal(actual, expected, 'Yesterday is NOT a valid date.');

  let today = moment().format('MM/DD/YYYY');
  workOrder.set('scheduled_date', new Date(today));
  errors = workOrder.get('validations.attrs.scheduled_date.errors');
  assert.equal(errors, 0, 'Today is a valid date.');

  let tomorrow = moment().add(1, 'days').format('MM/DD/YYYY');
  workOrder.set('scheduled_date', new Date(tomorrow));
  errors = workOrder.get('validations.attrs.scheduled_date.errors');
  assert.equal(errors, 0, 'Tomorrow is a valid date.');
});

test('rollback scheduled_date', function(assert) {
  function createWorkOrder() {
    let workOrder =  this.store.push('work-order', { 
      id: WD.idOne, 
      scheduled_date: WD.scheduledDateOne
    });
    workOrder.save();
    return workOrder;
  }
  run(() => {
    workOrder = createWorkOrder.call(this);
  });
  let actual = workOrder.get('scheduled_date');
  assert.equal(actual, WD.scheduledDateOne, 'Date is ' + WD.scheduledDateOne);
  let tomorrow = moment().add(1, 'day').format('L');
  let tomorrowDate = new Date(tomorrow);
  workOrder.set('scheduled_date', tomorrowDate);
  actual = workOrder.get('scheduled_date');
  assert.equal(workOrder.get('isDirty'), true, ' work order is dirty');
  assert.equal(actual, tomorrowDate, 'Date is ' + tomorrowDate);
  workOrder.rollbackProperty('scheduled_date');
  assert.equal(workOrder.get('isDirty'), false, ' work order is NOT dirty');
  actual = workOrder.get('scheduled_date');
  assert.equal(actual, WD.scheduledDateOne, 'Date is ' + WD.scheduledDateOne);
});

test('cost_estimate validation with number length to prevent backend not accepting number', function(assert) {
  workOrder.set('cost_estimate', 0);
  let errors = workOrder.get('validations.attrs.cost_estimate.errors');
  assert.equal(errors, 0, 'presence is not required for a valid cost_estimate.');
  workOrder.set('cost_estimate', 1000000000000.0000);
  errors = workOrder.get('validations.attrs.cost_estimate.errors');
  let actual = errors[0].message;
  let expected = 'errors.work_order.cost_estimate.length';
  assert.equal(actual, expected, 'length is greater than 15 digits');
  workOrder.set('cost_estimate', 99999999999.0001);
  errors = workOrder.get('validations.attrs.cost_estimate.errors');
  actual = errors[0].message;
  expected = 'errors.work_order.cost_estimate.length';
  assert.equal(actual, expected, 'length is greater than 15 digits');
  workOrder.set('cost_estimate', 99999999999.0000);
  errors = workOrder.get('validations.attrs.cost_estimate.errors');
  assert.equal(errors, 0, 'correct number of digits for valid cost_estimate');
});
