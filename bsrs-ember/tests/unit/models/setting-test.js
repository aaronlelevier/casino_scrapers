import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, setting;

module('unit: setting', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting']);
    }
});

test('test generic attrs on the model', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, dashboard_text: SD.dashboard_text});
    assert.equal(setting.get('id'), SD.id);
    assert.equal(setting.get('name'), SD.name);
    assert.equal(setting.get('title'), SD.title);
    assert.equal(setting.get('dashboard_text'), SD.dashboard_text);
});

test('test computed title', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, dashboard_text: SD.dashboard_text});
    assert.equal(setting.get('title'), SD.title);
    setting.title = 'general.patton';
    store.push('setting', setting);
    assert.equal(setting.get('title'), 'general.patton');
});

// dirty tracking tests: start

test('company_code', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('company_code', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('company_code', '');
    assert.equal(setting.get('isDirty'), false);
});

test('company_name', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('company_name', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('company_name', '');
    assert.equal(setting.get('isDirty'), false);
});

test('dashboard_text', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('dashboard_text', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('dashboard_text', '');
    assert.equal(setting.get('isDirty'), false);
});

test('login_grace', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('login_grace', 'x');
    assert.equal(setting.get('isDirty'), true);
});

test('modules', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('modules', 'x');
    assert.equal(setting.get('isDirty'), true);
});

test('test_mode', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('test_mode', 'x');
    assert.equal(setting.get('isDirty'), true);
});

test('test_contractor_email', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('test_contractor_email', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('test_contractor_email', '');
    assert.equal(setting.get('isDirty'), false);
});

test('test_contractor_phone', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('test_contractor_phone', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('test_contractor_phone', '');
    assert.equal(setting.get('isDirty'), false);
});

test('dt_start_key', (assert) => {
    setting = store.push('setting', {id: SD.id});
    assert.equal(setting.get('isDirty'), false);
    setting.set('dt_start_key', 'x');
    assert.equal(setting.get('isDirty'), true);
    setting.set('dt_start_key', '');
    assert.equal(setting.get('isDirty'), false);
});

// dirty tracking tests: end

test('serialize', (assert) => {
    setting = store.push('setting', {
        id: SD.id,
        name: SD.name,
        title: SD.title,
        company_code: SD.company_code,
        company_name: SD.company_name,
        dashboard_text: SD.dashboard_text,
        login_grace: SD.login_grace,
        modules: SD.modules,
        test_mode: SD.test_mode,
        test_contractor_email: SD.test_contractor_email,
        test_contractor_phone: SD.test_contractor_phone,
        dt_start_key: SD.dt_start_key
    });
    var serialize = setting.serialize();
    assert.equal(serialize.id, SD.id);
    assert.equal(serialize.name, SD.name);
    assert.equal(serialize.title, SD.title);
    assert.equal(serialize.settings.company_code, SD.company_code);
    assert.equal(serialize.settings.company_name, SD.company_name);
    assert.equal(serialize.settings.dashboard_text, SD.dashboard_text);
    assert.equal(serialize.settings.login_grace, SD.login_grace);
    assert.equal(serialize.settings.modules, SD.modules);
    assert.equal(serialize.settings.test_mode, SD.test_mode);
    assert.equal(serialize.settings.test_contractor_email, SD.test_contractor_email);
    assert.equal(serialize.settings.test_contractor_phone, SD.test_contractor_phone);
    assert.equal(serialize.settings.dt_start_key, SD.dt_start_key);

});
