import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import TDeserializer from 'bsrs-ember/deserializers/tenant';
import CountryD from 'bsrs-ember/vendor/defaults/country';
import TenantJoinCountryD from 'bsrs-ember/vendor/defaults/tenant-join-country';
import PND from 'bsrs-ember/vendor/defaults/phone-number';
import PNTD from 'bsrs-ember/vendor/defaults/phone-number-type';
import ED from 'bsrs-ember/vendor/defaults/email';
import ETD from 'bsrs-ember/vendor/defaults/email-type';
import AD from 'bsrs-ember/vendor/defaults/address';
import SD from 'bsrs-ember/vendor/defaults/state';
import CD from 'bsrs-ember/vendor/defaults/country';
import ATD from 'bsrs-ember/vendor/defaults/address-type';
import PD from 'bsrs-ember/vendor/defaults/person';

var store, tenant, deserializer;

module('unit: tenant deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-list', 'model:person', 'model:currency', 'model:tenant-join-country', 'model:country', 'model:phonenumber', 'model:email', 'model:address', 'model:state', 'model:phone-number-type', 'model:email-type', 'model:address-type', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = TDeserializer.create({ simpleStore: store });
    run(() => {
      tenant = store.push('tenant', { id: TD.idOne });
      store.push('phone-number-type', {id: PNTD.officeId, name: PNTD.officeName});
      store.push('email-type', {id: ETD.workId, name: ETD.workName});
      store.push('address-type', {id: ATD.officeId, name: ATD.officeName});
    });
  }
});

test('deserialize single', assert => {
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  assert.equal(tenant.get('id'), TD.idOne);
  assert.equal(tenant.get('scid'), TD.scidOne);
  assert.equal(tenant.get('company_name'), TD.companyNameOne);
  assert.equal(tenant.get('company_code'), TD.companyCodeOne);
  assert.equal(tenant.get('dashboard_text'), TD.dashboardTextOne);
  assert.equal(tenant.get('implementation_contact_initial'), TD.implementationContactInitialOne);
  assert.equal(tenant.get('billing_contact'), TD.billingContactOne);
  assert.equal(tenant.get('test_mode'), TD.testModeFalse);
  assert.equal(tenant.get('default_currency_fk'), TD.currencyOne);
  assert.equal(tenant.get('default_currency').get('id'), TD.currencyOne);
  assert.equal(tenant.get('default_currency').get('name'), TD.name);
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.equal(tenant.get('countries').objectAt(0).get('name'), CountryD.nameOne);
  assert.equal(tenant.get('billing_phone_number_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number').get('id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number').get('number'), PND.numberOne);
  assert.equal(tenant.get('billing_phone_number').get('detail'), true);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('id'), PNTD.officeId);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('name'), PNTD.officeName);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type_fk'), PNTD.officeId);
  assert.equal(tenant.get('billing_email_fk'), ED.idOne);
  assert.equal(tenant.get('billing_email').get('id'), ED.idOne);
  assert.equal(tenant.get('billing_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('billing_email').get('detail'), true);
  assert.equal(tenant.get('billing_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('billing_email').get('email_type').get('name'), ETD.workName);
  assert.equal(tenant.get('billing_email').get('email_type_fk'), ETD.workId);
  assert.equal(tenant.get('billing_address_fk'), AD.idOne);
  assert.equal(tenant.get('billing_address').get('id'), AD.idOne);
  assert.equal(tenant.get('billing_address').get('address'), AD.streetOne);
  assert.equal(tenant.get('billing_address').get('city'), AD.cityOne);
  assert.equal(tenant.get('billing_address').get('state').get('id'), AD.stateOne);
  assert.equal(tenant.get('billing_address').get('state').get('name'), SD.nameOne);
  assert.equal(tenant.get('billing_address').get('state_fk'), AD.stateOne);
  assert.equal(tenant.get('billing_address').get('country').get('id'), AD.countryOne);
  assert.equal(tenant.get('billing_address').get('country_fk'), AD.countryOne);
  assert.equal(tenant.get('billing_address').get('detail'), true);
  assert.equal(tenant.get('billing_address').get('address_type').get('id'), ATD.officeId);
  assert.equal(tenant.get('billing_address').get('address_type').get('name'), ATD.officeName);
  assert.equal(tenant.get('billing_address').get('address_type_fk'), ATD.officeId);
  assert.equal(tenant.get('implementation_email_fk'), ED.idTwo);
  assert.equal(tenant.get('implementation_email').get('id'), ED.idTwo);
  assert.equal(tenant.get('implementation_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('implementation_email').get('detail'), true);
  assert.equal(tenant.get('implementation_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('implementation_email').get('email_type').get('name'), ETD.workName);
  assert.equal(tenant.get('implementation_email').get('email_type_fk'), ETD.workId);
  assert.equal(tenant.get('implementation_contact').get('id'), PD.id);
  assert.equal(tenant.get('implementation_contact').get('fullname'), PD.fullname);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

/* Countries */

test('existing tenant w/ country, and server returns no country - want no country b/c that is the most recent', assert => {
  store.push('tenant-join-country', {id: TenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  tenant = store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  assert.equal(tenant.get('countries').get('length'), 1);
  let json = TF.detail();
  json.countries = [];
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('countries').get('length'), 0);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing tenant w/ country, and server returns w/ 1 extra country', assert => {
  store.push('tenant-join-country', {id: TenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  let json = TF.detail();
  json.countries.push({id: CountryD.unusedId});
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('countries').get('length'), 2);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing tenant w/ country and get same country', assert => {
  store.push('tenant-join-country', {id: TenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('countries').get('length'), 1);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

/* Contact */

test('existing billing_phone_number same number different type (change from mobile to office)', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_phone_number_fk: PND.idOne});
  store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, tenants: [TD.idOne]});
  store.push('phone-number-type', {id: PNTD.mobileId, name: PNTD.mobileName, phonenumbers: [PND.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_phone_number').get('id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number').get('number'), PND.numberOne);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('id'), PNTD.officeId); //idOne is the same as officeId
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('name'), PNTD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_phone_number same number same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_phone_number_fk: PND.idOne});
  store.push('phonenumber', {id: PND.idOne, number: PND.numberOne, tenants: [TD.idOne]});
  store.push('phone-number-type', {id: PNTD.officeId, name: PNTD.officeName, phonenumbers: [PND.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_phone_number').get('id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number').get('number'), PND.numberOne);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('id'), PNTD.officeId); //idOne is the same as officeId
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('name'), PNTD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_phone_number different number same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_phone_number_fk: PND.idOne});
  store.push('phonenumber', {id: PND.idOne, number: PND.numberTwo, tenants: [TD.idOne]});
  store.push('phone-number-type', {id: PNTD.officeId, name: PNTD.officeName, phonenumbers: [PND.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_phone_number').get('id'), PND.idOne);
  assert.equal(tenant.get('billing_phone_number').get('number'), PND.numberOne);
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('id'), PNTD.officeId); //idOne is the same as officeId
  assert.equal(tenant.get('billing_phone_number').get('phone_number_type').get('name'), PNTD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_email same email different type (change from personal to office)', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_email_fk: ED.idOne});
  store.push('email', {id: ED.idOne, email: ED.emailOne, tenants: [TD.idOne]});
  store.push('email-type', {id: ETD.personalId, name: ETD.personalName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_email').get('id'), ED.idOne);
  assert.equal(tenant.get('billing_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('billing_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('billing_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_email same email same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_email_fk: ED.idOne});
  store.push('email', {id: ED.idOne, email: ED.emailOne, tenants: [TD.idOne]});
  store.push('email-type', {id: ETD.workId, name: ETD.workName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_email').get('id'), ED.idOne);
  assert.equal(tenant.get('billing_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('billing_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('billing_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_email different email same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_email_fk: ED.idOne});
  store.push('email', {id: ED.idOne, email: ED.emailTwo, tenants: [TD.idOne]});
  store.push('email-type', {id: ETD.workId, name: ETD.workName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_email').get('id'), ED.idOne);
  assert.equal(tenant.get('billing_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('billing_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('billing_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing implementation_email same email different type (change from personal to office)', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, implementation_email_fk: ED.idTwo});
  store.push('email', {id: ED.idTwo, email: ED.emailOne, tenants_implementation: [TD.idOne]});
  store.push('email-type', {id: ETD.personalId, name: ETD.personalName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('implementation_email').get('id'), ED.idTwo);
  assert.equal(tenant.get('implementation_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('implementation_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('implementation_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});
test('existing implementation_email same email same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, implementation_email_fk: ED.idTwo});
  store.push('email', {id: ED.idTwo, email: ED.emailOne, tenants_implementation: [TD.idOne]});
  store.push('email-type', {id: ETD.workId, name: ETD.workName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('implementation_email').get('id'), ED.idTwo);
  assert.equal(tenant.get('implementation_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('implementation_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('implementation_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});
test('existing implementation_email different email same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, implementation_email_fk: ED.idTwo});
  store.push('email', {id: ED.idTwo, email: ED.emailTwo, tenants: [TD.idOne]});
  store.push('email-type', {id: ETD.workId, name: ETD.workName, emails: [ED.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('implementation_email').get('id'), ED.idTwo);
  assert.equal(tenant.get('implementation_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('implementation_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('implementation_email').get('email_type').get('name'), ETD.workName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_address same address different type (change from shipping to office)', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_address_fk: AD.idOne});
  store.push('address', {id: AD.idOne, address: AD.streetOne, city: AD.cityOne, state_fk: SD.idOne, country_fk: CD.idOne, tenants: [TD.idOne]});
  store.push('state', {id: SD.idOne, name: SD.nameOne, addresses: [AD.idOne]});
  store.push('country', {id: CD.idOne, name: CD.nameOne, addresses: [AD.idOne]});
  store.push('address-type', {id: ATD.shippingId, name: ATD.personalName, addresses: [AD.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_address').get('id'), AD.idOne);
  assert.equal(tenant.get('billing_address').get('address'), AD.streetOne);
  assert.equal(tenant.get('billing_address').get('city'), AD.cityOne);
  assert.equal(tenant.get('billing_address').get('postal_code'), AD.zipOne);
  assert.equal(tenant.get('billing_address').get('state').get('id'), SD.idOne);
  assert.equal(tenant.get('billing_address').get('state').get('name'), SD.nameOne);
  assert.equal(tenant.get('billing_address').get('country').get('id'), CD.idOne);
  assert.equal(tenant.get('billing_address').get('country').get('name'), CD.nameOne);
  assert.equal(tenant.get('billing_address').get('address_type').get('id'), ATD.officeId);
  assert.equal(tenant.get('billing_address').get('address_type').get('name'), ATD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_address same address same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_address_fk: AD.idOne});
  store.push('address', {id: AD.idOne, address: AD.streetOne, tenants: [TD.idOne]});
  store.push('address-type', {id: ATD.officeId, name: ATD.officeName, addresses: [AD.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_address').get('id'), AD.idOne);
  assert.equal(tenant.get('billing_address').get('address'), AD.streetOne);
  assert.equal(tenant.get('billing_address').get('address_type').get('id'), ATD.officeId); //idOne is the same as officeId
  assert.equal(tenant.get('billing_address').get('address_type').get('name'), ATD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing billing_address different address same type', assert => {
  tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, billing_address_fk: AD.idOne});
  store.push('address', {id: AD.idOne, address: AD.addressTwo, tenants: [TD.idOne]});
  store.push('address-type', {id: ATD.officeId, name: ATD.officeName, addresses: [AD.idOne]});
  store.push('tenant', {id: TD.idOne, tenant_countries_fks: [TenantJoinCountryD.idOne]});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('billing_address').get('id'), AD.idOne);
  assert.equal(tenant.get('billing_address').get('address'), AD.streetOne);
  assert.equal(tenant.get('billing_address').get('address_type').get('id'), ATD.officeId); //idOne is the same as officeId
  assert.equal(tenant.get('billing_address').get('address_type').get('name'), ATD.officeName);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('deserialize list', assert => {
  let json = TF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('tenant-list').get('length'), 10);
  tenant = store.find('tenant-list').objectAt(0);
  assert.equal(tenant.get('id'), TD.idOne);
  assert.equal(tenant.get('company_name'), TD.companyNameOne+'0');
  assert.equal(tenant.get('company_code'), TD.companyCodeOne+'0');
  assert.equal(tenant.get('test_mode'), TD.test_mode);
});
