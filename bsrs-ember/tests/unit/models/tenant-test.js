import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CountriesD from 'bsrs-ember/vendor/defaults/country';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import TenantJoinCountriesD from 'bsrs-ember/vendor/defaults/tenant-join-country';

var store, tenant, currency, inactive_currency;

moduleFor('model:tenant', 'Unit | Model | tenant', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username', 'validator:address-street', 'validator:address-postal'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-join-country', 'model:country', 'model:currency', 'model:phonenumber', 'model:phone-number-type', 'model:email', 'model:email-type', 'model:address', 'model:address-type', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    run(() => {
      tenant = store.push('tenant', {id: TD.idOne});
    });
  }
});

test('dirty test | company_name', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('company_name', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('company_name', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | company_code', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('company_code', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('company_code', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | dashboard_text', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('dashboard_text', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('dashboard_text', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | implementation_contact', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('implementation_contact', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('implementation_contact', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | billing_contact', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('billing_contact', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('billing_contact', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('serialize', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, currency_fk: CurrencyD.idOne, billing_phone_fk: PND.idOne, billing_email_fk: ED.idOne, implementation_email_fk: ED.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, tenants: [TD.idOne]});
    store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
    store.push('email', {id: ED.idOne, email: ED.emailOne, tenants: [TD.idOne], tenants_implementation: [TD.idOne]});
    store.push('email-type', {id: ETD.idOne, name: ED.workEmail, emails: [ED.idOne]});
    store.push('address', {id: AD.idOne, address: AD.addressOne, tenants: [TD.idOne]});
    store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  let ret = tenant.serialize();
  assert.equal(ret.id, TD.idOne);
  assert.equal(ret.company_name, TD.companyNameOne);
  assert.equal(ret.currency, TD.currencyOne);
  assert.equal(ret.countries.length, 1);
  assert.equal(ret.billing_phone.id, PND.idOne);
  assert.equal(ret.billing_phone.number, PND.numberOne);
  assert.equal(ret.billing_phone.type, PNTD.idOne);
  assert.equal(ret.billing_email.id, ED.idOne);
  assert.equal(ret.billing_email.email, ED.emailOne);
  assert.equal(ret.billing_email.type, ETD.idOne);
  assert.equal(ret.billing_address.id, AD.idOne);
  assert.equal(ret.billing_address.address, AD.addressOne);
  assert.equal(ret.billing_address.type, ATD.idOne);
  assert.equal(ret.implementation_email.id, ED.idOne);
  assert.equal(ret.implementation_email.email, ED.emailOne);
  assert.equal(ret.implementation_email.type, ETD.idOne);
});

/* CURRENCY */
test('related currency should return one currency for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('currency').get('id'), CurrencyD.idOne);
});

test('change_currency - will update the currencys currency and dirty the model', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: undefined});
    store.push('currency', {id: CurrencyD.idOne, tenants: []});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.equal(tenant.get('currency'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('currencyIsNotDirty'));
  tenant.change_currency({id: CurrencyD.idOne});
  assert.equal(tenant.get('currency_fk'), undefined);
  assert.equal(tenant.get('currency.id'), CurrencyD.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('currencyIsDirty'));
});

test('saveCurrency - currency - tenant will set currency_fk to current currency id', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('currency.id'), CurrencyD.idOne);
  tenant.change_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('currency.id'), CurrencyD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('currencyIsDirty'));
  tenant.saveCurrency();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('currencyIsDirty'));
  assert.equal(tenant.get('currency_fk'), CurrencyD.idTwo);
  assert.equal(tenant.get('currency.id'), CurrencyD.idTwo);
});

test('rollbackCurrency - currency - tenant will set currency to current currency_fk', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('currency.id'), CurrencyD.idOne);
  tenant.change_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('currency.id'), CurrencyD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('currencyIsDirty'));
  tenant.rollbackCurrency();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('currencyIsDirty'));
  assert.equal(tenant.get('currency.id'), CurrencyD.idOne);
  assert.equal(tenant.get('currency_fk'), CurrencyD.idOne);
});

/* BILLING_PHONE */
test('related billing_phone should return one billing_phone for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('billing_phone').get('id'), PND.idOne);
});
test('change_billing_phone - will update the tenants billing_phone and dirty the model', (assert) => {
  let other_billing_phone;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_fk: undefined});
    store.push('phonenumber', {id: PND.idOne, tenants: []});
    other_billing_phone = store.push('phonenumber', {id: PND.idTwo, tenants: []});
  });
  assert.equal(tenant.get('billing_phone'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingPhoneIsNotDirty'));
  tenant.change_billing_phone({id: PND.idOne});
  assert.equal(tenant.get('billing_phone_fk'), undefined);
  assert.equal(tenant.get('billing_phone.id'), PND.idOne);
  assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
  assert.equal(tenant.get('billingPhoneIsDirty'), true);
});
test('saveBillingPhone - billing_phone - tenant will set billing_phone_fk to current billing_phone id', (assert) => {
  let other_billing_phone;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
    other_billing_phone = store.push('phonenumber', {id: PND.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone.id'), PND.idOne);
  tenant.change_billing_phone({id: other_billing_phone.get('id')});
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone.id'), PND.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingPhoneIsDirty'));
  tenant.saveBillingPhone();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingPhoneIsDirty'));
  assert.equal(tenant.get('billing_phone_fk'), PND.idTwo);
  assert.equal(tenant.get('billing_phone.id'), PND.idTwo);
});
test('rollbackBillingPhone - billing_phone - tenant will set billing_phone to current billing_phone_fk', (assert) => {
  let other_billing_phone;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
    other_billing_phone = store.push('phonenumber', {id: PND.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone.id'), PND.idOne);
  tenant.change_billing_phone({id: other_billing_phone.get('id')});
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone.id'), PND.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingPhoneIsDirty'));
  tenant.rollbackBillingPhone();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingPhoneIsDirty'));
  assert.equal(tenant.get('billing_phone.id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
});

/* BILLING EMAIL */
test('related billing email should return one email for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('billing_email').get('id'), ED.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});
test('change_billing_email - will update the tenants email and dirty the model', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: undefined});
    store.push('email', {id: ED.idOne, tenants: []});
    other_email = store.push('email', {id: ED.idTwo, tenants: []});
  });
  assert.equal(tenant.get('billing_email'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingEmailIsNotDirty'));
  tenant.change_billing_email({id: ED.idOne});
  assert.equal(tenant.get('billing_email_fk'), undefined);
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
  assert.equal(tenant.get('billingEmailIsDirty'), true);
});
test('saveBillingEmail - email - tenant will set email_fk to current email id', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants: [TD.idOne]});
    other_email = store.push('email', {id: ED.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  tenant.change_billing_email({id: other_email.get('id')});
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
  assert.equal(tenant.get('billing_email.id'), ED.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingEmailIsDirty'));
  tenant.saveBillingEmail();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingEmailIsDirty'));
  assert.equal(tenant.get('billing_email_fk'), ED.idTwo);
  assert.equal(tenant.get('billing_email.id'), ED.idTwo);
});
test('rollbackBillingEmail - email - tenant will set email to current email_fk', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants: [TD.idOne]});
    other_email = store.push('email', {id: ED.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  tenant.change_billing_email({id: other_email.get('id')});
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
  assert.equal(tenant.get('billing_email.id'), ED.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingEmailIsDirty'));
  tenant.rollbackBillingEmail();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingEmailIsDirty'));
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
});

/* BILLING ADDRESS */
test('related billing address should return one address for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: AD.idOne});
    store.push('address', {id: AD.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('billing_address').get('id'), AD.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});
test('change_billing_address - will update the tenants address and dirty the model', (assert) => {
  let other_address;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: undefined});
    store.push('address', {id: AD.idOne, tenants: []});
    other_address = store.push('address', {id: AD.idTwo, tenants: []});
  });
  assert.equal(tenant.get('billing_address'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingAddressIsNotDirty'));
  tenant.change_billing_address({id: AD.idOne});
  assert.equal(tenant.get('billing_address_fk'), undefined);
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
  assert.equal(tenant.get('billingAddressIsDirty'), true);
});
test('saveBillingAddress - address - tenant will set address_fk to current address id', (assert) => {
  let other_address;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: AD.idOne});
    store.push('address', {id: AD.idOne, tenants: [TD.idOne]});
    other_address = store.push('address', {id: AD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  tenant.change_billing_address({id: other_address.get('id')});
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
  assert.equal(tenant.get('billing_address.id'), AD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingAddressIsDirty'));
  tenant.saveBillingAddress();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingAddressIsDirty'));
  assert.equal(tenant.get('billing_address_fk'), AD.idTwo);
  assert.equal(tenant.get('billing_address.id'), AD.idTwo);
});
test('rollbackBillingAddress - address - tenant will set address to current address_fk', (assert) => {
  let other_address;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: AD.idOne});
    store.push('address', {id: AD.idOne, tenants: [TD.idOne]});
    other_address = store.push('address', {id: AD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  tenant.change_billing_address({id: other_address.get('id')});
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
  assert.equal(tenant.get('billing_address.id'), AD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingAddressIsDirty'));
  tenant.rollbackBillingAddress();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingAddressIsDirty'));
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
});

/* IMPLEMENTATION EMAIL */
test('related implementation email should return one email for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants_implementation: [TD.idOne]});
  });
  assert.equal(tenant.get('implementation_email').get('id'), ED.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});
test('change_implementation_email - will update the tenants_implementation email and dirty the model', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_email_fk: undefined});
    store.push('email', {id: ED.idOne, tenants_implementation: []});
    other_email = store.push('email', {id: ED.idTwo, tenants_implementation: []});
  });
  assert.equal(tenant.get('implementation_email'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('implementationEmailIsNotDirty'));
  tenant.change_implementation_email({id: ED.idOne});
  assert.equal(tenant.get('implementation_email_fk'), undefined);
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  assert.equal(tenant.get('isDirtyOrRelatedDirty'), true);
  assert.equal(tenant.get('implementationEmailIsDirty'), true);
});
test('saveImplementationEmail - email - tenant will set email_fk to current email id', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants_implementation: [TD.idOne]});
    other_email = store.push('email', {id: ED.idTwo, tenants_implementation: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  tenant.change_implementation_email({id: other_email.get('id')});
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
  assert.equal(tenant.get('implementation_email.id'), ED.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('implementationEmailIsDirty'));
  tenant.saveImplementationEmail();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('implementationEmailIsDirty'));
  assert.equal(tenant.get('implementation_email_fk'), ED.idTwo);
  assert.equal(tenant.get('implementation_email.id'), ED.idTwo);
});
test('rollbackImplementationEmail - email - tenant will set email to current email_fk', (assert) => {
  let other_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_email_fk: ED.idOne});
    store.push('email', {id: ED.idOne, tenants_implementation: [TD.idOne]});
    other_email = store.push('email', {id: ED.idTwo, tenants_implementation: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  tenant.change_implementation_email({id: other_email.get('id')});
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
  assert.equal(tenant.get('implementation_email.id'), ED.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('implementationEmailIsDirty'));
  tenant.rollbackImplementationEmail();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('implementationEmailIsDirty'));
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
});

/* COUNTRIES */
test('countries property should return all associated countries. also confirm related and join model attr values', (assert) => {
  let countries;
  run(() => {
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountriesD.idOne]});
    store.push('country', {id: CountriesD.idOne});
    countries = tenant.get('countries');
  });
  assert.equal(countries.get('length'), 1);
  assert.deepEqual(tenant.get('countries_ids'), [CountriesD.idOne]);
  assert.deepEqual(tenant.get('tenant_countries_ids'), [TenantJoinCountriesD.idOne]);
  assert.equal(countries.objectAt(0).get('id'), CountriesD.idOne);
});

test('countries property is not dirty when no countries present (undefined)', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: undefined});
    store.push('country', {id: CountriesD.id});
  });
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.ok(tenant.get('countriesIsNotDirty'));
});

test('countries property is not dirty when no countries present (empty array)', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: []});
    store.push('country', {id: CountriesD.id});
  });
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.ok(tenant.get('countriesIsNotDirty'));
});

test('remove_country - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountriesD.idOne]});
  });
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant.get('tenant_countries_ids').length, 1);
  assert.equal(tenant.get('tenant_countries_fks').length, 1);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.remove_country(CountriesD.idOne);
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.equal(tenant.get('tenant_countries_ids').length, 0);
  assert.equal(tenant.get('tenant_countries_fks').length, 1);
  assert.ok(tenant.get('countriesIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('add_country - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountriesD.idOne]});
  });
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant.get('tenant_countries_ids').length, 1);
  assert.equal(tenant.get('tenant_countries_fks').length, 1);
  assert.deepEqual(tenant.get('countries_ids'), [CountriesD.idOne]);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.add_country({id: CountriesD.idTwo});
  assert.equal(tenant.get('countries').get('length'), 2);
  assert.equal(tenant.get('tenant_countries_ids').length, 2);
  assert.equal(tenant.get('tenant_countries_fks').length, 1);
  assert.deepEqual(tenant.get('countries_ids'), [CountriesD.idOne, CountriesD.idTwo]);
  assert.equal(tenant.get('countries').objectAt(0).get('id'), CountriesD.idOne);
  assert.equal(tenant.get('countries').objectAt(1).get('id'), CountriesD.idTwo);
  assert.ok(tenant.get('countriesIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('saveCountries - countries - will reset the previous countries with multiple tenants', (assert) => {
  let countries_unused = {id: CountriesD.unusedId};
  run(() => {
    store.push('country', {id: CountriesD.idOne});
    store.push('country', {id: CountriesD.idTwo});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idTwo, tenant_pk: TD.idOne, country_pk: CountriesD.idTwo});
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountriesD.idOne, TenantJoinCountriesD.idTwo]});
  });
  assert.equal(tenant.get('countries').get('length'), 2);
  tenant.remove_country(CountriesD.idOne);
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.ok(tenant.get('countriesIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveCountries();
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.add_country(countries_unused);
  assert.equal(tenant.get('countries').get('length'), 2);
  assert.ok(tenant.get('countriesIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveCountries();
  assert.equal(tenant.get('countries').get('length'), 2);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackCountries - countries - multiple tenants with the same countries will rollbackCountries correctly', (assert) => {
  let tenant_two;
  run(() => {
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idTwo, tenant_pk: TD.idTwo, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountriesD.idOne]});
    tenant_two = store.push('tenant', {id: TD.idTwo, tenant_countries_fks: [TenantJoinCountriesD.idTwo]});
  });
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant_two.get('countries').get('length'), 1);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countriesIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant_two.remove_country(CountriesD.idOne);
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant_two.get('countries').get('length'), 0);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countriesIsDirty'));
  assert.ok(tenant_two.get('isDirtyOrRelatedDirty'));
  tenant_two.rollbackCountries();
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant_two.get('countries').get('length'), 1);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countriesIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant.remove_country(CountriesD.idOne);
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.equal(tenant_two.get('countries').get('length'), 1);
  assert.ok(tenant.get('countriesIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant_two.get('countriesIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant.rollbackCountries();
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant_two.get('countries').get('length'), 1);
  assert.ok(tenant.get('countriesIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countriesIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change currency and countries', assert => {
  // currency
  run(() => {
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_currency({id: inactive_currency.get('id')});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  // countries
  assert.equal(tenant.get('countries').get('length'), 0);
  run(() => {
    store.push('country', {id: CountriesD.idOne});
  });
  tenant.add_country({id: CountriesD.idOne});
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - currency and countries', assert => {
  // currency
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: CurrencyD.idOne});
    currency = store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('currency').get('id'), inactive_currency.get('id'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.equal(tenant.get('currency').get('id'), currency.get('id'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  // countries
  assert.equal(tenant.get('countries').get('length'), 0);
  run(() => {
    store.push('country', {id: CountriesD.idOne});
  });
  tenant.add_country({id: CountriesD.idOne});
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('tenant validations', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, currency_fk: CurrencyD.idOne});
  });
  const attrs = tenant.get('validations').get('attrs');
  assert.ok(attrs.get('company_name'));
  assert.equal(tenant.get('validations').get('_validators').company_name[0].get('_type'), 'presence');
  assert.equal(tenant.get('validations').get('_validators').company_name[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('company_name').get('messages'), ['errors.tenant.company_name']);
  assert.ok(attrs.get('currency'));
  assert.deepEqual(attrs.get('currency').get('messages'), ['errors.tenant.currency']);
});
