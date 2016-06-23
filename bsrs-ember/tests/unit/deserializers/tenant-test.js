import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import TF from 'bsrs-ember/vendor/tenant_fixtures';
import TenantDeserializer from 'bsrs-ember/deserializers/tenant';

var store, tenant, run = Ember.run,
  deserializer;

module('unit: tenant deserializer test', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant', 'service:i18n']);
    deserializer = TenantDeserializer.create({
      simpleStore: store
    });
    run(() => {
      tenant = store.push('tenant', {
        id: TD.id,
        name: TD.name
      });
    });
  }
});

test('tenant correctly deserialized tenants object', (assert) => {
  let json = TF.detail();
  run(() => {
    deserializer.deserialize(json, TD.id);
  });
  assert.equal(tenant.get('company_code'), TD.company_code);
  assert.equal(tenant.get('company_name'), TD.company_name);
  assert.equal(tenant.get('dashboard_text'), TD.dashboard_text);
  assert.equal(tenant.get('dt_start_id'), TD.dt_start_id);
  assert.equal(tenant.get('dt_start').id, TD.dt_start_id);
  assert.equal(tenant.get('dt_start').key, TD.dt_start_key);
  assert.equal(tenant.get('default_currency'), TD.default_currency);
  assert.equal(tenant.get('test_mode'), TD.test_mode);
});