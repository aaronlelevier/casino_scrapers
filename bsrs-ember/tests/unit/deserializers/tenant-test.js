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
import ATD from 'bsrs-ember/vendor/defaults/address-type';

var store, tenant, deserializer;

module('unit: tenant deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-list', 'model:currency', 'model:tenant-join-country', 'model:country', 'model:phonenumber', 'model:email', 'model:address', 'model:state', 'model:phone-number-type', 'model:email-type', 'model:address-type', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
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
  assert.equal(tenant.get('company_name'), TD.companyNameOne);
  assert.equal(tenant.get('currency_fk'), TD.currencyOne);
  assert.equal(tenant.get('currency').get('id'), TD.currencyOne);
  assert.equal(tenant.get('currency').get('name'), TD.name);
  assert.equal(tenant.get('billing_phone_fk'), PND.idOne);
  assert.equal(tenant.get('billing_phone').get('id'), PND.idOne);
  assert.equal(tenant.get('billing_phone').get('number'), PND.numberOne);
  assert.equal(tenant.get('billing_phone').get('detail'), true);
  assert.equal(tenant.get('billing_phone').get('phone_number_type').get('id'), PNTD.officeId);
  assert.equal(tenant.get('billing_phone').get('phone_number_type').get('name'), PNTD.officeName);
  assert.equal(tenant.get('billing_phone').get('phone_number_type_fk'), PNTD.officeId);
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
  assert.equal(tenant.get('implementation_email_fk'), ED.idOne);
  assert.equal(tenant.get('implementation_email').get('id'), ED.idOne);
  assert.equal(tenant.get('implementation_email').get('email'), ED.emailOne);
  assert.equal(tenant.get('implementation_email').get('detail'), true);
  assert.equal(tenant.get('implementation_email').get('email_type').get('id'), ETD.workId);
  assert.equal(tenant.get('implementation_email').get('email_type').get('name'), ETD.workName);
  assert.equal(tenant.get('implementation_email').get('email_type_fk'), ETD.workId);
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

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

test('deserialize list', assert => {
  let json = TF.list();
  run(() => {
    deserializer.deserialize(json);
  });
  assert.equal(store.find('tenant-list').get('length'), 9);
  tenant = store.find('tenant-list').objectAt(0);
  assert.equal(tenant.get('id'), TD.idOne);
  assert.equal(tenant.get('company_name'), TD.companyNameOne+'1');
  assert.equal(tenant.get('currency').id, `${TD.currencyOne.slice(0,-1)}1`);
  assert.equal(tenant.get('currency').name, TD.name+'1');
});
