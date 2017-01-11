import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import moment from 'moment';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();

let store, model, model2, trans;

moduleForComponent('ticket-display', 'integration: ticket-display test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne, WD.idTwo]});
      model = store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne, 
        cost_estimate_currency_fk: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
      model2 = store.push('work-order', { id: WD.idTwo, cost_estimate: WD.costEstimateTwo, scheduled_date: WD.scheduledDateTwo, 
        cost_estimate_currency_fk: CurrencyD.idOne, status_fk: WOSD.idTwo, provider_fk: ProviderD.idOne });
      store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, address1: ProviderD.address1One, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
      store.push('provider', {id: ProviderD.idTwo, name: ProviderD.nameTwo, address1: ProviderD.address1Two, logo: ProviderD.logoTwo, workOrders: [WD.idTwo]});
      store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    });
  },
});

test('header - shows provider name and address with logo, cost estimate, scheduled date and status name', function(assert) {
  this.wos = store.find('work-order');
  this.render(hbs`{{work-orders/ticket-display wos=wos}}`);
  assert.equal(this.$('[data-test-id="provider-name0"]').text(), model.get('provider.name'));
  assert.equal(this.$('[data-test-id="provider-name1"]').text(), model2.get('provider.name'));
  assert.equal(this.$('[data-test-id="provider-address1-0"]').text(), model.get('provider.address1'));
  assert.equal(this.$('[data-test-id="provider-address1-1"]').text(), model2.get('provider.address1'));
  const logo1 = this.$('[data-test-id="provider-logo0"]').css('background-image');
  assert.equal(logo1.replace(/\"/g, ''), `url(${model.get('provider.logo')})`);
  const logo2 = this.$('[data-test-id="provider-logo0"]').css('background-image');
  assert.equal(logo2.replace(/\"/g, ''), `url(${model2.get('provider.logo')})`);
  assert.equal(this.$('[data-test-id="scheduled-date1"]').text(), moment(model.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="scheduled-date1"]').text(), moment(model2.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="cost-estimate0"]').text(), model.get('cost_estimate'));
  assert.equal(this.$('[data-test-id="cost-estimate1"]').text(), model2.get('cost_estimate'));
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(0)').text(), model.get('status.name'));
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(1)').text(), model2.get('status.name'));
});

test('labels are translated', function(assert) { 
  this.wos = store.find('work-order');
  this.render(hbs`{{work-orders/ticket-display wos=wos}}`);
  assert.equal(this.$('label:eq(0)').text().trim(), trans.t('work_order.label.scheduled_date'));
  assert.equal(this.$('label:eq(1)').text().trim(), trans.t('work_order.label.cost_estimate'));
});

test('if no work order photo, then display wrench (test just asserts class name)', function(assert) {
  run(() => {
    model = store.push('work-order', { id: WD.idOne, provider_fk: ProviderD.idOne });
    store.push('work-order', { id: WD.idTwo, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne });
  });
  this.wos = store.find('work-order');
  this.render(hbs`{{work-orders/ticket-display wos=wos}}`);
  assert.equal(this.$('.wrench').length, 2);
});
