import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import TD from 'bsrs-ember/vendor/defaults/tenant';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, tenant;

module('unit: tenant model tests', {
  beforeEach() {
    store = module_registry(this.container, this.registry, ['model:tenant']);
  }
});

// dirty tracking tests: start

test('company_code', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('company_code', 'x');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('company_code', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('company_name', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('company_name', 'x');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('company_name', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('dashboard_text', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('dashboard_text', 'x');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('dashboard_text', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('test_mode', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('test_mode', 'x');
  assert.equal(tenant.get('isDirty'), true);
});

test('dt_start_id', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('dt_start_id', 'x');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('dt_start_id', '');
  assert.equal(tenant.get('isDirty'), false);
});

test('default_currency_id', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id
  });
  assert.equal(tenant.get('isDirty'), false);
  tenant.set('default_currency_id', 'x');
  assert.equal(tenant.get('isDirty'), true);
  tenant.set('default_currency_id', '');
  assert.equal(tenant.get('isDirty'), false);
});

// dirty tracking tests: end

test('serialize', (assert) => {
  tenant = store.push('tenant', {
    id: TD.id,
    company_code: TD.company_code,
    company_name: TD.company_name,
    dashboard_text: TD.dashboard_text,
    test_mode: TD.test_mode,
    dt_start_id: TD.dt_start_id,
    default_currency_id: TD.default_currency_id,
  });
  var serialize = tenant.serialize();
  assert.equal(serialize.id, TD.id);
  assert.equal(serialize.company_code, TD.company_code);
  assert.equal(serialize.company_name, TD.company_name);
  assert.equal(serialize.dashboard_text, TD.dashboard_text);
  assert.equal(serialize.test_mode, TD.test_mode);
  assert.equal(serialize.dt_start, TD.dt_start_id);
  assert.equal(serialize.default_currency, TD.default_currency_id);
});
