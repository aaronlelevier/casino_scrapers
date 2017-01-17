import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import WORK_ORDER_STATUS_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order-status';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import PERSON_CURRENT from 'bsrs-ember/vendor/defaults/person-current';
import moment from 'moment';
import waitFor from 'ember-test-helpers/wait';

const WD = WORK_ORDER_DEFAULTS.defaults();
const WOSD = WORK_ORDER_STATUS_DEFAULTS.defaults();
const ProviderD = PROVIDER_DEFAULTS.defaults();
const PC = PERSON_CURRENT.defaults();

let store;

moduleForComponent('ticket-display', 'integration: ticket-display test', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry);
    run(() => {
      store.push('person-current', PERSON_CURRENT.defaults());
      store.push('work-order-status', {id: WOSD.idOne, name: WOSD.nameOne, workOrders: [WD.idOne]});
      store.push('work-order', { id: WD.idOne, cost_estimate: WD.costEstimateOne, scheduled_date: WD.scheduledDateOne,
        cost_estimate_currency: CurrencyD.idOne, status_fk: WOSD.idOne, provider_fk: ProviderD.idOne });
      store.push('provider', {id: ProviderD.idOne, name: ProviderD.nameOne, city: ProviderD.cityOne, logo: ProviderD.logoOne, workOrders: [WD.idOne]});
      store.push('currency', {id: CurrencyD.idOne, workOrders: [WD.idOne]});
    });
  },
});

test('work order info is displayed', function(assert) {
  this.model = store.find('work-order').objectAt(0);
  this.indx = 0;
  this.render(hbs`{{work-orders/ticket-display model=model indx=indx}}`);
  assert.equal(this.$('[data-test-id*="expander-collapsed"]').length, 1);
  assert.equal(this.$('[data-test-id="provider-name0"]').text(), this.model.get('provider.name'));
  assert.equal(this.$('[data-test-id="provider-address-0"]').text().trim(), this.model.get('provider.city'));
  const logo1 = this.$('[data-test-id="provider-logo0"]').css('background-image');
  assert.equal(logo1.replace(/\"/g, ''), `url(${this.model.get('provider.logo')})`);
  assert.equal(this.$('[data-test-id="scheduled-date0"]').text(), moment(this.model.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="cost-estimate0"]').text(), this.model.get('cost_estimate'));
  assert.equal(this.$('[data-test-id="wo-status-name"]:eq(0)').text(), this.model.get('status.name'));
});

test('cost estimate must be a number and not negative (will not show validation msg b/c input-currency formats any input to be a +number)', function(assert){
  this.model = store.find('work-order').objectAt(0);
  this.indx = 0;
  this.render(hbs`{{work-orders/ticket-display model=model indx=indx}}`);
  this.$('[data-test-id="expander-collapsed0"]').click();
  assert.equal(Ember.$('.validated-input-error-dialog:eq(0)').text().trim(), '');
  this.$('.t-amount').val('-1').trigger('focusout');
  return waitFor().then(() => {
    assert.equal(Ember.$('.t-validation-cost_estimate').text().trim(), '');
    this.$('.t-amount').val('100').trigger('focusout');
    return waitFor().then(() => {
      assert.equal(Ember.$('.t-validation-cost_estimate').text().trim(), '');
    });
  });
});
