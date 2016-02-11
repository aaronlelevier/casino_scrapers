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
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, welcome_text: SD.welcome_text});
    assert.equal(setting.get('id'), SD.id);
    assert.equal(setting.get('name'), SD.name);
    assert.equal(setting.get('title'), SD.title);
    assert.equal(setting.get('welcome_text'), SD.welcome_text);
});

test('test computed title', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, welcome_text: SD.welcome_text});
    assert.equal(setting.get('title'), SD.title);
    setting.title = 'general.patton';
    store.push('setting', setting);
    assert.equal(setting.get('title'), 'general.patton');
});

test('welcome_text', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, welcome_text: SD.welcome_text});
    assert.equal(setting.get('isDirty'), false);
    setting.set('welcome_text', 'x');
    assert.equal(setting.get('isDirty'), true);
});

test('login_grace', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, welcome_text: SD.welcome_text});
    assert.equal(setting.get('isDirty'), false);
    setting.set('login_grace', 'x');
    assert.equal(setting.get('isDirty'), true);
});

test('serialize', (assert) => {
    setting = store.push('setting', {id: SD.id, name: SD.name, title: SD.title, welcome_text: SD.welcome_text, login_grace: SD.login_grace});
    var serialize = setting.serialize();
    // welcome_text
    assert.equal(serialize.welcome_text, setting.get('welcome_text'));
    setting.set('welcome_text', 'x');
    serialize = setting.serialize();
    assert.equal(serialize.welcome_text, 'x');
    // login_grace
    setting.set('login_grace', serialize.login_grace);
    assert.equal(serialize.login_grace, setting.get('login_grace'));
    setting.set('login_grace', 2);
    serialize = setting.serialize();
    assert.equal(serialize.login_grace, 2);
});