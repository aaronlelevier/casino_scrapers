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
import CD from 'bsrs-ember/vendor/defaults/country';
import SD from 'bsrs-ember/vendor/defaults/state';
import PD from 'bsrs-ember/vendor/defaults/person';
import DD from 'bsrs-ember/vendor/defaults/dtd';
import TenantJoinCountriesD from 'bsrs-ember/vendor/defaults/tenant-join-country';

var store, tenant, currency, inactive_currency;

moduleFor('model:tenant', 'Unit | Model | tenant', {
  needs: ['validator:presence', 'validator:length', 'validator:has-many', 'validator:format', 'validator:unique-username', 'validator:address-street', 'validator:address-postal', 'validator:belongs-to'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-join-country', 'model:dtd', 'model:person', 'model:country', 'model:currency', 'model:phonenumber', 'model:phone-number-type', 'model:email', 'model:email-type', 'model:address', 'model:state', 'model:address-type', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
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

test('dirty test | implementation_contact_initial', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('implementation_contact_initial', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('implementation_contact_initial', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | billing_contact', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('billing_contact', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('billing_contact', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dirty test | test_mode', assert => {
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('test_mode', 'wat');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('test_mode', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('serialize', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, default_currency_fk: CurrencyD.idOne, billing_phone_number_fk: PND.idOne, billing_email_fk: ED.idOne, implementation_email_fk: ED.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    store.push('tenant-join-country', {id: TenantJoinCountriesD.idOne, tenant_pk: TD.idOne, country_pk: CountriesD.idOne});
    store.push('country', {id: CountriesD.idOne});
    store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, tenants: [TD.idOne]});
    store.push('phone-number-type', {id: PNTD.idOne, phonenumbers: [PND.idOne]});
    store.push('email', {id: ED.idOne, email: ED.emailOne, tenants: [TD.idOne], tenants_implementation: [TD.idOne]});
    store.push('email-type', {id: ETD.idOne, name: ED.workEmail, emails: [ED.idOne]});
    store.push('address', {id: AD.idOne, address: AD.addressOne, city: AD.cityOne, postal_code: AD.zipOne, state_fk: SD.idOne, country_fk: CD.idOne, tenants: [TD.idOne]});
    store.push('country', {id: CD.idOne, addresses: [AD.idOne]});
    store.push('state', {id: SD.idOne, addresses: [AD.idOne]});
    store.push('address-type', {id: ATD.idOne, addresses: [AD.idOne]});
  });
  let ret = tenant.serialize();
  assert.equal(ret.id, TD.idOne);
  assert.equal(ret.company_name, TD.companyNameOne);
  assert.equal(ret.company_code, TD.companycodeOne);
  assert.equal(ret.dashboard_text, TD.companycodeOne);
  assert.equal(ret.default_currency, TD.currencyOne);
  assert.equal(ret.countries.length, 1);
  assert.equal(ret.billing_phone_number.id, PND.idOne);
  assert.equal(ret.billing_phone_number.number, PND.numberOne);
  assert.equal(ret.billing_phone_number.type, PNTD.idOne);
  assert.equal(ret.billing_email.id, ED.idOne);
  assert.equal(ret.billing_email.email, ED.emailOne);
  assert.equal(ret.billing_email.type, ETD.idOne);
  assert.equal(ret.billing_address.id, AD.idOne);
  assert.equal(ret.billing_address.address, AD.addressOne);
  assert.equal(ret.billing_address.postal_code, AD.zipOne);
  assert.equal(ret.billing_address.city, AD.cityOne);
  assert.equal(ret.billing_address.state, SD.idOne);
  assert.equal(ret.billing_address.country, CD.idOne);
  assert.equal(ret.billing_address.type, ATD.idOne);
  assert.equal(ret.implementation_email.id, ED.idOne);
  assert.equal(ret.implementation_email.email, ED.emailOne);
  assert.equal(ret.implementation_email.type, ETD.idOne);
});

/* CURRENCY */
test('related currency should return one currency for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('default_currency').get('id'), CurrencyD.idOne);
});

test('change_default_currency - will update the currencys currency and dirty the model', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: undefined});
    store.push('currency', {id: CurrencyD.idOne, tenants: []});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.equal(tenant.get('default_currency'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('defaultCurrencyIsNotDirty'));
  tenant.change_default_currency({id: CurrencyD.idOne});
  assert.equal(tenant.get('default_currency_fk'), undefined);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('defaultCurrencyIsDirty'));
});

test('saveDefaultCurrency - currency - tenant will set default_currency_fk to current currency id', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idOne);
  tenant.change_default_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('defaultCurrencyIsDirty'));
  tenant.saveDefaultCurrency();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('defaultCurrencyIsDirty'));
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idTwo);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idTwo);
});

test('rollbackDefaultCurrency - currency - tenant will set currency to current default_currency_fk', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idOne);
  tenant.change_default_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idOne);
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('defaultCurrencyIsDirty'));
  tenant.rollbackDefaultCurrency();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('defaultCurrencyIsDirty'));
  assert.equal(tenant.get('default_currency.id'), CurrencyD.idOne);
  assert.equal(tenant.get('default_currency_fk'), CurrencyD.idOne);
});

/* billing_phone_number */
test('related billing_phone_number should return one billing_phone_number for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_number_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
  });
  assert.equal(tenant.get('billing_phone_number').get('id'), PND.idOne);
});

test('change_billing_phone_number - will update the tenants billing_phone_number and setting type will dirty the model', (assert) => {
  let related_phone;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_number_fk: undefined});
    store.push('phonenumber', {id: PND.idOne, tenants: []});
  });
  assert.equal(tenant.get('billing_phone_number'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsNotDirty'));
  tenant.change_billing_phone_number({id: PND.idOne});
  assert.equal(tenant.get('billing_phone_number_fk'), undefined);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsNotDirty'));
  related_phone = tenant.get('billing_phone_number');
  related_phone.change_phone_number_type({id: PNTD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsDirty'));
});

test('saveBillingPhoneNumber - billing_phone_number - tenant will set billing_phone_number_fk to current billing_phone_number id', (assert) => {
  let other_billing_phone_number;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_number_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
    other_billing_phone_number = store.push('phonenumber', {id: PND.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idOne);
  tenant.change_billing_phone_number({id: other_billing_phone_number.get('id')});
  other_billing_phone_number.change_phone_number_type({id: PNTD.idOne});
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idTwo);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsDirty'));
  tenant.saveRelatedSingle('billing_phone_number');
  tenant.saveBillingPhoneNumber();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingPhoneNumberIsDirty'));
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idTwo);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idTwo);
});

test('rollbackBillingPhoneNumber - billing_phone_number - tenant will set billing_phone_number to current billing_phone_number_fk', (assert) => {
  let other_billing_phone_number;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_phone_number_fk: PND.idOne});
    store.push('phonenumber', {id: PND.idOne, tenants: [TD.idOne]});
    other_billing_phone_number = store.push('phonenumber', {id: PND.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idOne);
  tenant.change_billing_phone_number({id: other_billing_phone_number.get('id')});
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number.id'), PND.idTwo);
  let phonenumber = tenant.get('billing_phone_number');
  phonenumber.change_phone_number_type({id: PNTD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsDirty'));
  tenant.rollbackBillingPhoneNumber();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('billingPhoneNumberIsDirty'));
  assert.equal(tenant.get('billing_phone_number.id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
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

test('change_billing_email - should update the tenants email and  setting the type or email should dirty the model', (assert) => {
  let related_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_email_fk: undefined});
    store.push('email', {id: ED.idOne, tenants: []});
  });
  assert.equal(tenant.get('billing_email'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingEmailIsNotDirty'));
  tenant.change_billing_email({id: ED.idOne});
  assert.equal(tenant.get('billing_email_fk'), undefined);
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingEmailIsNotDirty'));
  related_email = tenant.get('billing_email');
  related_email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingEmailIsDirty'));
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
  let email = tenant.get('billing_email');
  email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingEmailIsDirty'));
  tenant.saveRelatedSingle('billing_email');
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
  let email = tenant.get('billing_email');
  email.change_email_type({id: ETD.idOne});
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

test('change_billing_address - will update the tenants address and setting the type should dirty the model', (assert) => {
  let related_address;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, billing_address_fk: undefined});
    store.push('address', {id: AD.idOne, tenants: []});
  });
  assert.equal(tenant.get('billing_address'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingAddressIsNotDirty'));
  tenant.change_billing_address({id: AD.idOne});
  assert.equal(tenant.get('billing_address_fk'), undefined);
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('billingAddressIsNotDirty'));
  related_address = tenant.get('billing_address');
  related_address.change_address_type({id: ATD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingAddressIsDirty'));
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
  let address = tenant.get('billing_address');
  address.change_address_type({id: ATD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('billingAddressIsDirty'));
  tenant.saveRelatedSingle('billing_address');
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
  let address = tenant.get('billing_address');
  address.change_address_type({id: ATD.idOne});
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

test('change_implementation_email - should update the tenants_implementation email and dirty the model when type or email are set', (assert) => {
  let related_email;
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_email_fk: undefined});
    store.push('email', {id: ED.idOne, tenants_implementation: []});
  });
  assert.equal(tenant.get('implementation_email'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('implementationEmailIsNotDirty'));
  tenant.change_implementation_email({id: ED.idOne});
  assert.equal(tenant.get('implementation_email_fk'), undefined);
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant.get('implementationEmailIsNotDirty'));
  related_email = tenant.get('implementation_email');
  related_email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('implementationEmailIsDirty'));
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
  let email = tenant.get('implementation_email');
  email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('implementationEmailIsDirty'));
  tenant.saveRelatedSingle('implementation_email');
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
  let email = tenant.get('implementation_email');
  email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant.get('implementationEmailIsDirty'));
  tenant.rollbackImplementationEmail();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(!tenant.get('implementationEmailIsDirty'));
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
});

/* IMPLEMENTATION CONTACT */
test('related implementation contact should return one contact for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, implementation_contact_fk: PD.idOne});
    store.push('person', {id: PD.idOne, tenants_implementation_contact: [TD.idOne]});
  });
  assert.equal(tenant.get('implementation_contact').get('id'), PD.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_implementation_contact changes the implementation_contact property on the tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.equal(tenant.get('implementation_contact'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_implementation_contact({id: PD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('saveRelated - implementation_contact - saves the new contact, and the tenant is clean', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.equal(tenant.get('implementation_contact'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_implementation_contact({id: PD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - implementation_contact - rolls back any changes for the implementation_contact', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('implementation_contact.id'), undefined);
  tenant.change_implementation_contact({id: PD.idOne});
  assert.equal(tenant.get('implementation_contact.id'), PD.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('implementation_contact.id'), undefined);
});

/* DTD */
test('related implementation contact should return one contact for a tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, dtd_start_fk: DD.idOne});
    store.push('dtd', {id: DD.idOne, tenants_dtd_start: [TD.idOne]});
  });
  assert.equal(tenant.get('dtd_start').get('id'), DD.idOne);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('change_dtd_start changes the dtd_start property on the tenant', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.equal(tenant.get('dtd_start'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_dtd_start({id: DD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('saveRelated - dtd_start - saves the new contact, and the tenant is clean', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.equal(tenant.get('dtd_start'), undefined);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_dtd_start({id: DD.idOne});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - dtd_start - rolls back any changes for the dtd_start', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('dtd_start.id'), undefined);
  tenant.change_dtd_start({id: DD.idOne});
  assert.equal(tenant.get('dtd_start.id'), DD.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.equal(tenant.get('dtd_start.id'), undefined);
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

test('saveRelated currency - change currency and save', assert => {
  // currency
  run(() => {
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_default_currency({id: inactive_currency.get('id')});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated countries - change countries and save', assert => {
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

test('saveRelated implemention email - change email and save', assert => {
  // implementation email
  tenant.change_implementation_email({id: ED.idOne});
  let email = tenant.get('implementation_email');
  email.change_email_type({id: ETD.idOne});
  assert.equal(tenant.get('implementation_email.id'), ED.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(email.get('emailTypeIsDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('implementationEmailIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated billing email - change email and save', assert => {
  // implementation email
  tenant.change_billing_email({id: ED.idOne});
  let email = tenant.get('billing_email');
  email.change_email_type({id: ETD.idOne});
  assert.equal(tenant.get('billing_email.id'), ED.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(email.get('emailTypeIsDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('billingEmailIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated billing phone - change phone and save', assert => {
  // implementation email
  tenant.change_billing_phone_number({id: PND.idOne});
  let phone = tenant.get('billing_phone_number');
  phone.change_phone_number_type({id: PNTD.idOne});
  assert.equal(tenant.get('billing_phone_number.id'), PND.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(phone.get('phoneNumberTypeIsDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('billingPhoneNumberIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('saveRelated billing address - change address and save', assert => {
  // implementation email
  tenant.change_billing_address({id: AD.idOne});
  let address = tenant.get('billing_address');
  address.change_address_type({id: ATD.idOne});
  assert.equal(tenant.get('billing_address.id'), AD.idOne);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(address.get('addressTypeIsDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('billingAddressIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - currency and countries', assert => {
  // currency
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: CurrencyD.idOne});
    currency = store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_default_currency({id: inactive_currency.get('id')});
  assert.equal(tenant.get('default_currency').get('id'), inactive_currency.get('id'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.equal(tenant.get('default_currency').get('id'), currency.get('id'));
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

test('rollback - related contact models', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  // implementation email
  tenant.change_implementation_email({id: ED.idOne});
  let implementation_email = tenant.get('implementation_email');
  implementation_email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('implementationEmailIsDirty'));
  // billing email
  tenant.change_billing_email({id: ED.idOne});
  let billing_email = tenant.get('billing_email');
  billing_email.change_email_type({id: ETD.idOne});
  assert.ok(tenant.get('billingEmailIsDirty'));
  // billing phone
  tenant.change_billing_phone_number({id: ED.idOne});
  let billing_phone_number = tenant.get('billing_phone_number');
  billing_phone_number.change_phone_number_type({id: ETD.idOne});
  assert.ok(tenant.get('billingPhoneNumberIsDirty'));
  // billing address
  tenant.change_billing_address({id: ED.idOne});
  let billing_address = tenant.get('billing_address');
  billing_address.change_address_type({id: ETD.idOne});
  assert.ok(tenant.get('billingAddressIsDirty'));
  // all is dirty
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.ok(tenant.get('implementationEmailIsNotDirty'));
  assert.ok(tenant.get('billingEmailIsNotDirty'));
  assert.ok(tenant.get('billingPhoneNumberIsNotDirty'));
  assert.ok(tenant.get('billingAddressIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('tenant validations', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, default_currency_fk: CurrencyD.idOne});
  });
  const attrs = tenant.get('validations').get('attrs');
  assert.ok(attrs.get('company_name'));
  assert.equal(tenant.get('validations').get('_validators').company_name[0].get('_type'), 'presence');
  assert.equal(tenant.get('validations').get('_validators').company_name[1].get('_type'), 'length');
  assert.deepEqual(attrs.get('company_name').get('messages'), ['errors.tenant.company_name']);
  assert.deepEqual(attrs.get('company_code').get('messages'), ['errors.tenant.company_code']);
  assert.deepEqual(attrs.get('dashboard_text').get('messages'), ['errors.tenant.dashboard_text']);
  assert.ok(attrs.get('default_currency'));
  assert.deepEqual(attrs.get('default_currency').get('messages'), ['errors.tenant.default_currency']);
  assert.ok(attrs.get('countries'));
  assert.deepEqual(attrs.get('countries').get('messages'), ['errors.tenant.countries']);
  assert.ok(attrs.get('billing_contact'));
  assert.deepEqual(attrs.get('billing_contact').get('messages'), ['errors.tenant.billing_contact']);
  assert.ok(attrs.get('implementation_contact_initial'));
  assert.deepEqual(attrs.get('implementation_contact_initial').get('messages'), ['errors.tenant.implementation_contact_initial']);
  assert.ok(attrs.get('billing_phone_number'));
  assert.deepEqual(attrs.get('billing_phone_number').get('content')[0].get('messages'), ['errors.tenant.billing_phone_number']);
  assert.ok(attrs.get('billing_email'));
  assert.deepEqual(attrs.get('billing_email').get('content')[0].get('messages'), ['errors.tenant.billing_email']);
  assert.ok(attrs.get('billing_address'));
  assert.deepEqual(attrs.get('billing_address').get('content')[0].get('messages'), ['errors.tenant.billing_address']);
});
