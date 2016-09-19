import Ember from 'ember';
const { run } = Ember;
import { moduleFor, test } from 'ember-qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import CurrencyD from 'bsrs-ember/vendor/defaults/currency';
import CountryD from 'bsrs-ember/vendor/defaults/country';
import tenantJoinCountryD from 'bsrs-ember/vendor/defaults/tenant-join-country';

var store, tenant, currency, inactive_currency;

moduleFor('model:tenant', 'Unit | Model | tenant', {
  needs: ['validator:presence', 'validator:length', 'validator:format', 'validator:unique-username'],
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'model:tenant-join-country', 'model:country', 'model:currency', 'model:person-current', 'service:person-current', 'service:translations-fetcher', 'service:i18n']);
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

test('serialize', assert => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, company_name: TD.companyNameOne, currency_fk: CurrencyD.idOne});
    store.push('currency', {id: CurrencyD.idOne, tenants: [TD.idOne]});
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    store.push('country', {id: CountryD.idOne});
  });
  let ret = tenant.serialize();
  assert.equal(ret.id, TD.idOne);
  assert.equal(ret.company_name, TD.companyNameOne);
  assert.equal(ret.currency, TD.currencyOne);
  assert.equal(ret.country.length, 1);
});

/* currency */
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

test('saveCurrency - currency - tenantwill set currency_fk to current currency id', (assert) => {
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

test('rollbackCurrency - currency - tenantwill set currency to current currency_fk', (assert) => {
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

/* tenant& PROFILE_FILTER */
test('country property should return all associated country. also confirm related and join model attr values', (assert) => {
  let country;
  run(() => {
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: [tenantJoinCountryD.idOne]});
    store.push('country', {id: CountryD.idOne});
    country = tenant.get('country');
  });
  assert.equal(country.get('length'), 1);
  assert.deepEqual(tenant.get('country_ids'), [CountryD.idOne]);
  assert.deepEqual(tenant.get('tenant_country_ids'), [tenantJoinCountryD.idOne]);
  assert.equal(country.objectAt(0).get('id'), CountryD.idOne);
});

test('country property is not dirty when no country present (undefined)', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: undefined});
    store.push('country', {id: CountryD.id});
  });
  assert.equal(tenant.get('country').get('length'), 0);
  assert.ok(tenant.get('countryIsNotDirty'));
});

test('country property is not dirty when no country present (empty array)', (assert) => {
  run(() => {
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: []});
    store.push('country', {id: CountryD.id});
  });
  assert.equal(tenant.get('country').get('length'), 0);
  assert.ok(tenant.get('countryIsNotDirty'));
});

test('remove_country - will remove join model and mark model as dirty', (assert) => {
  run(() => {
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    store.push('country', {id: CountryD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: [tenantJoinCountryD.idOne]});
  });
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant.get('tenant_country_ids').length, 1);
  assert.equal(tenant.get('tenant_country_fks').length, 1);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.remove_country(CountryD.idOne);
  assert.equal(tenant.get('country').get('length'), 0);
  assert.equal(tenant.get('tenant_country_ids').length, 0);
  assert.equal(tenant.get('tenant_country_fks').length, 1);
  assert.ok(tenant.get('countryIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('add_country - will create join model and mark model dirty', (assert) => {
  run(() => {
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    store.push('country', {id: CountryD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: [tenantJoinCountryD.idOne]});
  });
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant.get('tenant_country_ids').length, 1);
  assert.equal(tenant.get('tenant_country_fks').length, 1);
  assert.deepEqual(tenant.get('country_ids'), [CountryD.idOne]);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.add_country({id: CountryD.idTwo});
  assert.equal(tenant.get('country').get('length'), 2);
  assert.equal(tenant.get('tenant_country_ids').length, 2);
  assert.equal(tenant.get('tenant_country_fks').length, 1);
  assert.deepEqual(tenant.get('country_ids'), [CountryD.idOne, CountryD.idTwo]);
  assert.equal(tenant.get('country').objectAt(0).get('id'), CountryD.idOne);
  assert.equal(tenant.get('country').objectAt(1).get('id'), CountryD.idTwo);
  assert.ok(tenant.get('countryIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
});

test('saveCountry - country - will reset the previous country with multiple tenants', (assert) => {
  let country_unused = {id: CountryD.unusedId};
  run(() => {
    store.push('country', {id: CountryD.idOne});
    store.push('country', {id: CountryD.idTwo});
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    store.push('tenant-join-country', {id: tenantJoinCountryD.idTwo, tenant_pk: TD.idOne, country_pk: CountryD.idTwo});
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: [tenantJoinCountryD.idOne, tenantJoinCountryD.idTwo]});
  });
  assert.equal(tenant.get('country').get('length'), 2);
  tenant.remove_country(CountryD.idOne);
  assert.equal(tenant.get('country').get('length'), 1);
  assert.ok(tenant.get('countryIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveCountry();
  assert.equal(tenant.get('country').get('length'), 1);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.add_country(country_unused);
  assert.equal(tenant.get('country').get('length'), 2);
  assert.ok(tenant.get('countryIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveCountry();
  assert.equal(tenant.get('country').get('length'), 2);
  assert.ok(tenant.get('isNotDirty'));
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollbackCountry - country - multiple tenants with the same country will rollbackCountry correctly', (assert) => {
  let tenant_two;
  run(() => {
    store.push('tenant-join-country', {id: tenantJoinCountryD.idOne, tenant_pk: TD.idOne, country_pk: CountryD.idOne});
    store.push('tenant-join-country', {id: tenantJoinCountryD.idTwo, tenant_pk: TD.idTwo, country_pk: CountryD.idOne});
    store.push('country', {id: CountryD.idOne});
    tenant = store.push('tenant', {id: TD.idOne, tenant_country_fks: [tenantJoinCountryD.idOne]});
    tenant_two = store.push('tenant', {id: TD.idTwo, tenant_country_fks: [tenantJoinCountryD.idTwo]});
  });
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant_two.get('country').get('length'), 1);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countryIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant_two.remove_country(CountryD.idOne);
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant_two.get('country').get('length'), 0);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countryIsDirty'));
  assert.ok(tenant_two.get('isDirtyOrRelatedDirty'));
  tenant_two.rollbackCountry();
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant_two.get('country').get('length'), 1);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countryIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant.remove_country(CountryD.idOne);
  assert.equal(tenant.get('country').get('length'), 0);
  assert.equal(tenant_two.get('country').get('length'), 1);
  assert.ok(tenant.get('countryIsDirty'));
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  assert.ok(tenant_two.get('countryIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
  tenant.rollbackCountry();
  assert.equal(tenant.get('country').get('length'), 1);
  assert.equal(tenant_two.get('country').get('length'), 1);
  assert.ok(tenant.get('countryIsNotDirty'));
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  assert.ok(tenant_two.get('countryIsNotDirty'));
  assert.ok(tenant_two.get('isNotDirtyOrRelatedNotDirty'));
});

/* Over Arching Test of saveRelated / rollBack */

test('saveRelated - change currency and country', assert => {
  // currency
  run(() => {
    inactive_currency = store.push('currency', {id: CurrencyD.idTwo, tenants: []});
  });
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  tenant.change_currency({id: inactive_currency.get('id')});
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
  // country
  assert.equal(tenant.get('country').get('length'), 0);
  run(() => {
    store.push('country', {id: CountryD.idOne});
  });
  tenant.add_country({id: CountryD.idOne});
  assert.equal(tenant.get('country').get('length'), 1);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.saveRelated();
  assert.ok(tenant.get('isNotDirtyOrRelatedNotDirty'));
});

test('rollback - currency and country', assert => {
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
  // country
  assert.equal(tenant.get('country').get('length'), 0);
  run(() => {
    store.push('country', {id: CountryD.idOne});
  });
  tenant.add_country({id: CountryD.idOne});
  assert.equal(tenant.get('country').get('length'), 1);
  assert.ok(tenant.get('isDirtyOrRelatedDirty'));
  tenant.rollback();
  assert.equal(tenant.get('country').get('length'), 0);
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
