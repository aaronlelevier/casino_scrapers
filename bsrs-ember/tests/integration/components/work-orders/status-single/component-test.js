import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WODS = WORK_ORDER_STATUS_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();

let store, model, trans;

moduleForComponent('work-orders/status-single', 'Integration | Component | work orders/status single', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('work-order-status', {id: WODS.idOne, name: WODS.nameFive, workOrders: [WD.idOne, WD.idTwo]});
      model = store.push('work-order', { id: WD.idOne, provider_fk: ProviderD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne, status_fk: WODS.idOne });
      store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, address1: ProviderD.address1One, logo: ProviderD.logoOne, workOrders: [ProviderD.idOne]});
    });
  },
});

test('it renders with check status', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/status-single model=model}}`);
  assert.ok(this.$('[data-test-id="wo-status-icon"]:eq(0) > i').attr('class').includes('check'));
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(0)').text().trim(), trans.t('work_order.status.new'));
});

test('it renders with exclamation-triangle status', function(assert) {
  run(() => {
    store.push('work-order-status', {id: WODS.idOne, name: WODS.nameOne, workOrders: [WD.idOne, WD.idTwo]});
  });
  this.model = model;
  this.render(hbs`{{work-orders/status-single model=model}}`);
  assert.ok(this.$('[data-test-id="wo-status-icon"]:eq(0) > i').attr('class').includes('exclamation-triangle'));
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(0)').text().trim(), trans.t('work_order.status.declined'));
});
