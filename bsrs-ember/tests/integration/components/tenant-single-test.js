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
import SD from 'bsrs-ember/vendor/defaults/country';
import TenantJoinCountriesD from 'bsrs-ember/vendor/defaults/tenant-join-country';
import page from 'bsrs-ember/tests/pages/tenant';
import generalPage from 'bsrs-ember/tests/pages/general';

var store, model, trans;

moduleForComponent('tenant-single', ' integration: tenant-single test', {
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

test('scott validation works', function(assert) {
  // like new form
  run(function() {
    model = store.push('tenant', {id: TD.idOne, company_name: undefined, billing_phone_number_fk: PND.idOne, billing_email_fk: ED.idOne, implementation_email_fk: ED.idOne, billing_address_fk: AD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: []});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
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
  assert.equal($input.length, 11);
  // assert.equal($('.t-validation-company_name').text().trim(), 'errors.tenant.company_name');
  // assert.equal($('.t-validation-company_code').text().trim(), 'errors.tenant.company_code');
  // assert.equal($('.t-validation-dashboard_text').text().trim(), 'errors.tenant.dashboard_text');
  // assert.equal($('.t-validation-implementation_contact').text().trim(), 'errors.tenant.implementation_contact');
  // assert.equal($('.t-validation-billing_contact').text().trim(), 'errors.tenant.billing_contact');
});

test('header - shows detail if not model.new', function(assert) {
  this.render(hbs `{{tenants/tenant-single model=model}}`);
  assert.equal(this.$('.t-tenant-header').text().trim(), trans.t('tenant.detail'));
});

test('header - shows new if model.new', function(assert) {
  model.set('new', true);
  this.set('model', model);
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

// test('billing information displays', function(assert) {
//   this.render(hbs `{{tenants/tenant-single}}`);
//   assert.equal(this.$('.t-tenant-company_name').get(0)['placeholder'], trans.t('tenant.company_name'));
// });
