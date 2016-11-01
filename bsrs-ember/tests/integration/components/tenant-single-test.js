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

test('scott validation works', function(assert) {
  // like new form
  run(function() {
    model = store.push('tenant', {id: TD.idOne, company_name: undefined, billing_phone_number_fk: PND.idOne, billing_email_fk: ED.idOne, implementation_email_fk: ED.idOne, billing_address_fk: AD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: []});
    store.push('phonenumber', {id: PND.idOne, number: undefined, tenants: [TD.idOne]});
    store.push('phone-number-type', {id: PNTD.idOne, name: PNTD.officeName, phonenumbers: [PND.idOne]});
    store.push('email', {id: ED.idOne, email: undefined, tenants: [TD.idOne], tenants_implementation: [TD.idOne]});
    store.push('email-type', {id: ETD.idOne, name: ETD.workEmail, emails: [ED.idOne]});
    store.push('address', {id: AD.idOne, address: undefined, city: undefined, postal_code: undefined, state_fk: SD.idOne, country_fk: CD.idOne, tenants: [TD.idOne]});
    store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
    store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
    store.push('address-type', {id: ATD.idOne, name: ATD.officeName, addresses: [AD.idOne]});
  });
  this.set('model', model);
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  let $input = this.$('.invalid');
  assert.equal($input.length, 0);
  generalPage.save();
  $input = this.$('.invalid');
  assert.equal($input.length, 14);
  assert.equal($('.t-validation-implementation_contact_initial').text().trim(), 'errors.tenant.implementation_contact_initial');
  assert.equal($('.t-validation-company_name').text().trim(), 'errors.tenant.company_name');
  assert.equal($('.t-validation-company_code').text().trim(), 'errors.tenant.company_code');
  assert.equal($('.t-validation-default_currency').text().trim(), 'errors.tenant.default_currency');
  assert.equal($('.t-validation-countries').text().trim(), 'errors.tenant.countries');
  assert.equal($('.t-validation-billing_contact').text().trim(), 'errors.tenant.billing_contact');
  assert.equal($('.t-validation-implementation_contact_initial').text().trim(), 'errors.tenant.implementation_contact_initial');
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
