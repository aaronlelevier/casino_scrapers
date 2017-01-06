import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import moment from 'moment';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WODS = WORK_ORDER_STATUS_DEFAULTS.defaults();

let store, model, model2, trans;

moduleForComponent('ticket-display', 'integration: ticket-display test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('work-order-status', {id: WODS.idOne, name: WODS.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      model = store.push('work-order', { id: WD.idOne, provider_name: WD.providerNameOne, provider_address1: WD.providerAddress1One,
      provider_logo: WD.providerLogoOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne, cost_estimate_currency_fk: CurrencyD.idOne,
      status_fk: WODS.idOne });
      model2 = store.push('work-order', { id: WD.idTwo, provider_name: WD.providerNameTwo, provider_address1: WD.providerAddress1Two,
      provider_logo: WD.providerLogoTwo, cost_estimate: WD.costEstimateTwo, scheduled_date: WD.scheduledDateTwo, cost_estimate_currency_fk: CurrencyD.idOne,
      status_fk: WODS.idTwo });
      store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    });
  },
});

test('header - shows provider name and address', function(assert) {
  this.wos = store.find('work-order');
  this.render(hbs`{{work-orders/ticket-display wos=wos}}`);
  assert.equal(this.$('[data-test-id="provider-name0"]').text(), model.get('provider_name'));
  assert.equal(this.$('[data-test-id="provider-name1"]').text(), model2.get('provider_name'));
  assert.equal(this.$('[data-test-id="provider-address1-0"]').text(), model.get('provider_address1'));
  assert.equal(this.$('[data-test-id="provider-address1-1"]').text(), model2.get('provider_address1'));
  // assert.equal(this.$('[data-test-id="provider-logo0"]').text(), model.get('provider_logo'));
  // assert.equal(this.$('[data-test-id="provider-logo1"]').text(), model2.get('provider_logo'));
  assert.equal(this.$('[data-test-id="scheduled-date1"]').text(), moment(model.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="scheduled-date1"]').text(), moment(model2.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="cost-estimate0"]').text(), model.get('cost_estimate'));
  assert.equal(this.$('[data-test-id="cost-estimate1"]').text(), model2.get('cost_estimate'));
  // assert.equal(this.$('[data-test-id="status0"]').text(), model.get('status'));
  // assert.equal(this.$('[data-test-id="status1"]').text(), model2.get('status'));
});

test('labels are translated', function(assert) { 
  this.wos = store.find('work-order');
  this.render(hbs`{{work-orders/ticket-display wos=wos}}`);
  assert.equal(this.$('label:eq(0)').text().trim(), trans.t('work_order.label.scheduled_date'));
  assert.equal(this.$('label:eq(1)').text().trim(), trans.t('work_order.label.cost_estimate'));
});
