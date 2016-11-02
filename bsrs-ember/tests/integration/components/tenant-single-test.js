import Ember from 'ember';
const { run } = Ember;
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import { getLabelText } from 'bsrs-ember/tests/helpers/translations';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CountriesD from 'bsrs-ember/vendor/defaults/country';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import CD from 'bsrs-ember/vendor/defaults/country';
import SD from 'bsrs-ember/vendor/defaults/state';
import TenantJoinCountriesD from 'bsrs-ember/vendor/defaults/tenant-join-country';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('tenant-single', 'integration: tenant-single test', {
  integration: true,
  setup() {
    page.setContext(this);
    generalPage.setContext(this);
    store = module_registry(this.container, this.registry, ['model:tenant']);
    trans = this.container.lookup('service:i18n');
    run(function() {
      model = store.push('tenant', {
        id: TD.idOne,
        company_name: TD.companyNameOne,
      });
    });
    this.set('model', model);
    const flexi = this.container.lookup('service:device/layout');
    const breakpoints = flexi.get('breakpoints');
    const width = breakpoints.find(bp => bp.name === 'desktop').begin + 5;
    flexi.set('width', width);
  },
  afterEach() {
    page.removeContext(this);
    generalPage.removeContext(this);
  }
});

test('scid - read only is populated if in detail, otherwise in create it is not present', function(assert) {
  // create
  run(function() {
    model = store.push('tenant', {id: TD.idOne, scid: undefined});
  });
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal($('[data-test-id="tenant-scid"]').length, 0);
  // detail
  run(function() {
    model = store.push('tenant', {id: TD.idOne, scid: TD.scidOne});
  });
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal($('[data-test-id="tenant-scid"]').val(), TD.scidOne);
});

test('header - shows company_name if present on the model', function(assert) {
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('.t-tenant-header').text().trim(), TD.companyNameOne);
  run(() => {
    store.push('tenant', {id: TD.idOne, company_name: undefined});
  });
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('.t-tenant-header').text().trim(), trans.t('tenant.new'));
});

test('labels are translated', function(assert) {
  this.render(hbs `{{tenants/tenant-single}}`);
  assert.equal(getLabelText('company_name'), trans.t('tenant.company_name'));
  assert.equal(getLabelText('currency'), trans.t('admin.tenant.currency'));
});

test('placeholders are translated', function(assert) {
  this.render(hbs `{{tenants/tenant-single}}`);
  assert.equal(this.$('.t-tenant-company_name').get(0)['placeholder'], trans.t('tenant.company_name'));
});

test('url hint should be bound to the company code value on the model', function(assert) {
  // like new form
  run(function() {
    model = store.push('tenant', {id: TD.idOne, company_code: undefined});
  });
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('[data-test-id="company_code_hint"]').text().trim(), 'https://_____.servicechannel.com');
  run(() => {
    store.push('tenant', {id: TD.idOne, company_code: TD.companyCodeOne});
  });
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('[data-test-id="company_code_hint"]').text().trim(), `https://${TD.companyCodeOne}.servicechannel.com`);
});
