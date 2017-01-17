import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUSES from 'bsrs-ember/vendor/defaults/work-order-status';
import CD from 'bsrs-ember/vendor/defaults/currency';
import CategoryD from 'bsrs-ember/vendor/defaults/category';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import WF from 'bsrs-ember/vendor/work_order_fixtures';
import WDeserializer from 'bsrs-ember/deserializers/work-order';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WOSD = WORK_ORDER_STATUSES.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();

let store, workOrder, deserializer;

module('unit: work-order deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:work-order', 'model:currency', 'model:category', 'model:provider', 'model:work-order-status',
    'service:i18n']);
    deserializer = WDeserializer.create({
      simpleStore: store
    });
    run(() => {
      workOrder = store.push('work-order', { id: WD.idOne });
      store.push('currency', { id: CD.idOne, name: CD.name });
    });
  }
});

test('deserialize single', assert => {
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CD.idOne);
  const currency = store.find('currency', CD.idOne);
  assert.equal(currency.get('workOrders').length, 1);
  assert.deepEqual(currency.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('cost_estimate_currency').get('id'), CD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency').get('name'), CD.name);
});

test('deserialize single with existing currency', assert => {
  store.push('currency', {id: CD.idOne, workOrders: [WD.idOne]});
  const json = WF.detail();
  run(() => {
    deserializer.deserialize(json, WD.idOne);
  });
  assert.equal(workOrder.get('id'), WD.idOne);
  assert.equal(workOrder.get('provider.name'), WD.providerNameOne);
  assert.equal(workOrder.get('cost_estimate_currency_fk'), CD.idOne);
  const currency = store.find('currency', CD.idOne);
  assert.equal(currency.get('workOrders').length, 1);
  assert.deepEqual(currency.get('workOrders'), [WD.idOne]);
  assert.equal(workOrder.get('cost_estimate_currency').get('id'), CD.idOne);
  assert.equal(workOrder.get('cost_estimate_currency').get('name'), CD.name);
});

//Work order status
test('deserialize single with no existing status', assert => {
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

test('deserialize single with existing status', assert => {
  store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameFive,  workOrders: [WD.idOne]});
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
test('deserialize single with no existing category', assert => {
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

test('deserialize single with existing category', assert => {
  store.push('category', {id: CategoryD.idOne, name: CategoryD.nameOne,  workOrders: [WD.idOne]});
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
test('deserialize single with no existing provider', assert => {
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

test('deserialize single with existing provider', assert => {
  store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne,  workOrders: [WD.idOne]});
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