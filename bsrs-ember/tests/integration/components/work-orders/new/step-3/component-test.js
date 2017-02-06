import Ember from 'ember';
const { run } = Ember;
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import CD from 'bsrs-ember/vendor/defaults/category';
import PROVIDER_DEFAULTS from 'bsrs-ember/vendor/defaults/provider';
import WORK_ORDER_DEFAULTS from 'bsrs-ember/vendor/defaults/work-order';
import moment from 'moment';

let WD, ProviderD, model, store;

moduleForComponent('work-orders/new/step-3', 'Integration | Component | work orders/new/step 3', {
  integration: true,
  setup() {
    store = module_registry(this.container, this.registry);
    WD = WORK_ORDER_DEFAULTS.defaults();
    ProviderD = PROVIDER_DEFAULTS.defaults();
    run(() => {
      model = store.push('work-order', {
        id: WD.idOne, approved_amount: WD.approvedAmount, scheduled_date: WD.scheduledDateOne,
        category_fk: CD.idOne, provider_fk: ProviderD.idOne, instructions: WD.instructions
      });
      store.push('category', { id: CD.idOne, name: CD.nameElectricalChild, workOrders: [WD.idOne] });
      store.push('provider', { id: ProviderD.idOne, name: ProviderD.nameOne, address1: ProviderD.address1One, 
        logo: ProviderD.logoOne, workOrders: [WD.idOne] });
    });
  }
});

test('it renders with display information', function(assert) {
  this.model = model;
  this.render(hbs`{{work-orders/new/step-3 model=model}}`);
  assert.equal(this.$('[data-test-id="provider-name"]').text(), model.get('provider.name'));
  assert.equal(this.$('[data-test-id="provider-address1"]').text(), model.get('provider.address1'));
  const logo1 = this.$('[data-test-id="provider-logo"]').css('background-image');
  assert.equal(logo1.replace(/\"/g, ''), `url(${model.get('provider.logo')})`);
  assert.equal(this.$('[data-test-id="scheduled-date"]').text(), moment(model.get('scheduled_date')).format('MM/DD/YYYY'));
  assert.equal(this.$('[data-test-id="approved-amount"]').text(), model.get('approved_amount'));
  assert.equal(this.$('[data-test-id="instructions"]').text(), model.get('instructions'));
});
