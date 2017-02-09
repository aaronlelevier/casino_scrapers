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

let WD, WOSD, ProviderD;

let store, model, model2, trans;

moduleForComponent('ticket-display', 'integration: ticket-display test', {
  integration: true,
  setup() {

    WD = WORK_ORDER_DEFAULTS.defaults();
    WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();
    ProviderD = PROVIDER_DEFAULTS.defaults();

    store = module_registry(this.container, this.registry);
    trans = this.container.lookup('service:i18n');
    run(() => {
      store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
      model = store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne,
        cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
      store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.address1One, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
      store.push('currency', {id: CurrencyD.idOne, decimal_digits: 2, symbol: '#'});
    });
  },
});

test('header - shows provider name and address with logo, cost estimate, scheduled date and status name', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  let provider = store.find('provider', ProviderD.idOne);
  this.render(hbs`{{work-orders/ticket-display-collapsed model=model indx="0"}}`);
  assert.equal(this.$('[data-test-id="provider-name0"]').text(), model.get('provider.name'));
  const logo1 = this.$('[data-test-id="provider-logo0"]').css('background-image');
  assert.equal(logo1.replace(/\"/g, ''), `url(${model.get('provider.logo')})`);
  assert.equal(this.$('[data-test-id="scheduled-date0"]').text(), moment(model.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="cost-estimate0"]').text().trim(), `#${model.get('cost_estimate')}`);
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(0)').text(), model.get('status.name'));
  //only city
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.city'));
  //only state
  run(()=>{
    provider.set('city', '');
    provider.set('state', ProviderD.stateOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.state'));
  //state and city
  run(()=>{
    provider.set('city', ProviderD.cityOne);
  });
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), model.get('provider.city') + ', ' + model.get('provider.state'));

});

test('labels are translated', function(assert) {
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-collapsed model=model indx="0"}}`);
  assert.equal(this.$('label:eq(0)').text().trim(), trans.t('work_order.label.scheduled_date'));
  assert.equal(this.$('label:eq(1)').text().trim(), trans.t('work_order.label.cost_estimate'));
});

test('if no work order photo, then display wrench (test just asserts class name)', function(assert) {
  run(() => {
    model = store.push('work-order', { id: WD.idOne, provider_fk: ProviderD.idOne });
    store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne });
  });
  this.model = store.find('work-order', WD.idOne);
  this.render(hbs`{{work-orders/ticket-display-collapsed model=model indx="0"}}`);
  assert.equal(this.$('.wrench').length, 1);
});
