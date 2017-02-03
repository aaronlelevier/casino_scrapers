import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import PERSON_DEFAULTS from 'bsrs-ember/vendor/defaults/person';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CategoryD from 'bsrs-ember/vendor/defaults/category';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import WF from 'bsrs-ember/vendor/work_order_fixtures';
import WDeserializer from 'bsrs-ember/deserializers/work-order';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WOSD = WORK_ORDER_STATUSES.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();
const PD = PERSON_DEFAULTS.defaults();

let store, workOrder, deserializer;

moduleFor('deserializer:work-order', 'Unit | Deserializer | work order', {
  needs: ['model:work-order', 'model:person', 'model:currency', 'model:category', 'model:provider', 'model:work-order-status',
  'validator:presence', 'service:i18n', 'service:currency', 'service:person-current', 'service:translations-fetcher', 'validator:unique-username', 
    'validator:length', 'validator:format', 'validator:presence', 'validator:has-many'],
  beforeEach() {
    store = module_registry(this.container, this.registry);
    const currency = this.container.lookup('service:currency');
    deserializer = WDeserializer.create({ simpleStore: store, currency: currency });
    run(() => {
      workOrder = store.push('work-order', { id: WD.idOne });
      store.push('currency', { id: CD.idOne, name: CD.name, decimal_digits: 2 });
    });
  }
});

test('deserialize single', function(assert) {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('cost_estimate_currency'), CD.idOne);
  assert.ok(workOrder.get('scheduled_date'));
  assert.ok(workOrder.get('completed_date'));
  assert.ok(workOrder.get('expiration_date'));
  assert.ok(workOrder.get('approval_date'));
  assert.equal(workOrder.get('approved_amount'), WD.approvedAmount);
  assert.equal(workOrder.get('cost_estimate'), WD.costEstimateOne);
  assert.equal(workOrder.get('gl_code'), WD.glCodeOne);
  assert.equal(workOrder.get('tracking_number'), WD.trackingNumberOne);
  assert.equal(workOrder.get('instructions'), WD.instructions);
});

test('will format cost_estimate based on currency decimal_digits', function(assert) {
  const json = WF.detail();
  json.cost_estimate = '350.0000';
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('cost_estimate'), WD.costEstimateOne);
});

//Work order status
test('deserialize single with no existing status', function(assert) {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('status_fk'), WOSD.idOne);
  const workOrderStatus = store.find('work-order-status', WOSD.idOne);
  assert.equal(workOrderStatus.get('workOrders').length, 1);
  assert.deepEqual(workOrderStatus.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.equal(workOrder.get('status').get('name'), WOSD.nameFive);
});

test('deserialize single with existing status', function(assert) {
  run(() => {
    store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameFive,  workOrders: [WD.idOne]});
  });
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('status_fk'), WOSD.idOne);
  const workOrderStatus = store.find('work-order-status', WOSD.idOne);
  assert.equal(workOrderStatus.get('workOrders').length, 1);
  assert.deepEqual(workOrderStatus.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('status').get('id'), WOSD.idOne);
  assert.equal(workOrder.get('status').get('name'), WOSD.nameFive);
});

//Work order category
test('deserialize single with no existing category', function(assert) {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('category_fk'), CategoryD.idOne);
  const workOrderCategory = store.find('category', CategoryD.idOne);
  assert.equal(workOrderCategory.get('workOrders').length, 1);
  assert.deepEqual(workOrderCategory.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('category').get('id'), CategoryD.idOne);
  assert.equal(workOrder.get('category').get('name'), CategoryD.nameOne);
});

test('deserialize single with existing category', function(assert) {
  run(() => {
    store.push('category', {id: CategoryD.idOne, name: CategoryD.nameOne,  workOrders: [WD.idOne]});
  });
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('category_fk'), CategoryD.idOne);
  const workOrderCategory = store.find('category', CategoryD.idOne);
  assert.equal(workOrderCategory.get('workOrders').length, 1);
  assert.deepEqual(workOrderCategory.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('category').get('id'), CategoryD.idOne);
  assert.equal(workOrder.get('category').get('name'), CategoryD.nameOne);
});

//Work order provider
test('deserialize single with no existing provider', function(assert) {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('provider_fk'), ProviderD.idOne);
  const workOrderProvider = store.find('provider', ProviderD.idOne);
  assert.equal(workOrderProvider.get('workOrders').length, 1);
  assert.deepEqual(workOrderProvider.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('provider').get('id'), ProviderD.idOne);
  assert.equal(workOrder.get('provider').get('name'), ProviderD.nameOne);
});

test('deserialize single with existing provider', function(assert) {
  run(() => {
    store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne,  workOrders: [WD.idOne]});
  });
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('provider_fk'), ProviderD.idOne);
  const workOrderProvider = store.find('provider', ProviderD.idOne);
  assert.equal(workOrderProvider.get('workOrders').length, 1);
  assert.deepEqual(workOrderProvider.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('provider').get('id'), ProviderD.idOne);
  assert.equal(workOrder.get('provider').get('name'), ProviderD.nameOne);
});

// Work Order Approver
test('deserialize single with no existing approver', assert => {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('approver.fullname'), PD.fullname);
  assert.equal(workOrder.get('approver_fk'), PD.idOne);
  const workOrderApprover = store.find('person', PD.idOne);
  assert.equal(workOrderApprover.get('workOrders').length, 1);
  assert.deepEqual(workOrderApprover.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.equal(workOrder.get('approver').get('fullname'), PD.fullname);
});

test('deserialize single with existing approver', assert => {
  const json = WF.detail();
  run(() => {
    store.push('person', {id: PD.idOne, fullname: PD.fullname,  workOrders: [WD.idOne]});
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('approver.fullname'), PD.fullname);
  assert.equal(workOrder.get('approver_fk'), PD.idOne);
  const workOrderApprover = store.find('person', PD.idOne);
  assert.equal(workOrderApprover.get('workOrders').length, 1);
  assert.deepEqual(workOrderApprover.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('approver').get('id'), PD.idOne);
  assert.equal(workOrder.get('approver').get('fullname'), PD.fullname);
});
