import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, setting;

module('unit: setting attrs', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting']);
    }
});

test('test dirty tracking on welcome text setting', (assert) => {
    setting = store.push('setting', {id: SD.id, welcome_text: SD.welcome_text});
    assert.equal(setting.get('welcome_text'), SD.welcome_text);
    assert.ok(setting.get('isNotDirty'));
    setting.set('welcome_text', 'ABC124');
    assert.ok(setting.get('isDirty'));
    setting.set('welcome_text', SD.welcome_text);
    assert.ok(setting.get('isNotDirty'));
});

test('test dirty tracking on login grace setting', (assert) => {
    setting = store.push('setting', {id: SD.id, login_grace: SD.login_grace});
    assert.equal(setting.get('login_grace'), SD.login_grace);
    assert.ok(setting.get('isNotDirty'));
    setting.set('login_grace', '3');
    assert.ok(setting.get('isDirty'));
    setting.set('login_grace', SD.login_grace);
    assert.ok(setting.get('isNotDirty'));
});
