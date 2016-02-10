import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import SETTING_DEFAULTS from 'bsrs-ember/vendor/defaults/setting';
import SETTING from 'bsrs-ember/vendor/setting_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, setting;

module('unit: setting', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting']);
    }
});

test('test generic attrs on the model', (assert) => {
    setting = store.push('setting', SETTING.detail());
    assert.equal(setting.get('id'), SETTING_DEFAULTS.id);
    assert.equal(setting.get('name'), SETTING_DEFAULTS.name);
    assert.equal(setting.get('title'), SETTING_DEFAULTS.title);
    assert.equal(setting.get('welcome_text'), SETTING_DEFAULTS.welcome_text);
});

test('test computed title', (assert) => {
    setting = store.push('setting', SETTING.detail());
    assert.equal(setting.get('title'), SETTING_DEFAULTS.title);
    setting.title = 'general.patton';
    store.push('setting', setting);
    assert.equal(setting.get('title'), 'general.patton');
});
