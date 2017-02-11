import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER from 'bsrs-ember/vendor/defaults/work-order';
import CD from 'bsrs-ember/vendor/defaults/category';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import WorkOrderRepository from 'bsrs-ember/repositories/work-order';

var store, category, workOrderRepo;
const WD = WORK_ORDER.defaults();

module('unit: work-order repository test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:category', 'model:currency', 'model:currency',
      'model:uuid', 'model:work-order', 'service:currency']);
    run(() => {
      store.push('currency', {id: CurrencyD.idOne, symbol: CurrencyD.symbol, default: true,
        code: CurrencyD.code, cost_estimate: CurrencyD.costEstimateOne, workOrders: [WD.idOne]});
    });
    const uuid = this.container.lookup('model:uuid');
    const currency = this.container.lookup('service:currency');
    workOrderRepo = WorkOrderRepository.create({ simpleStore: store, type: 'work-order', 
      url:'', uuid: uuid, currency: currency });
    }
});

test('create - will use inherited category cost amount if applicable', function(assert) {
  run(() => {
    category = store.push('category', { id: CD.idOne, inherited: { cost_amount: { inherited_value: '100.00' } } });
  });
  const work_order = workOrderRepo.createWorkOrder(category, 1);
  assert.equal(work_order.get('approved_amount'), '100.00');
});
