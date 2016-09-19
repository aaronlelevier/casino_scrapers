import Ember from 'ember';
const { run } = Ember;
import { test, module } from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import TDeserializer from 'bsrs-ember/deserializers/tenant';
import CountryD from 'bsrs-ember/vendor/defaults/country';
import tenantJoinCountryD from 'bsrs-ember/vendor/defaults/tenant-join-country';

var store, tenant, deserializer;

module('unit: tenant deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-list', 'model:currency', 'model:tenant-join-country', 'model:country', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
    deserializer = TDeserializer.create({
      simpleStore: store
    });
    run(() => {
      tenant = store.push('tenant', { id: TD.idOne });
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
});

test('existing tenant w/ country, and server returns no country - want no country b/c that is the most recent', assert => {
  store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  tenant = store.push('tenant', {id: TD.idOne, joinModel_associatedModelFks: [tenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  const country = tenant.get('country');
  assert.equal(country.get('length'), 1);
  let json = TF.detail();
  json.country = [];
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('country').get('length'), 0);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing tenant w/ country, and server returns w/ 1 extra country', assert => {
  store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  store.push('tenant', {id: TD.idOne, joinModel_associatedModelFks: [tenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  let json = TF.detail();
  json.country.push({id: CountryD.unusedId});
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('country').get('length'), 2);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('existing tenant w/ country and get same country', assert => {
  store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
  store.push('tenant', {id: TD.idOne, joinModel_associatedModelFks: [tenantJoinCountryD.idOne]});
  store.push('country', {id: CountryD.idOne});
  const json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.idOne);
  });
  tenant = store.find('tenant', TD.idOne);
  assert.equal(tenant.get('country').get('length'), 1);
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
  assert.equal(tenant.get('company_name'), TD.companyNameOne+'1');
  assert.equal(tenant.get('currency').id, `${TD.currencyOne.slice(0,-1)}1`);
  assert.equal(tenant.get('currency').name, TD.name+'1');
});
