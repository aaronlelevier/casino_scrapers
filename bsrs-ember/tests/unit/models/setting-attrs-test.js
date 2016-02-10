import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import SETTING_DEFAULTS from 'bsrs-ember/vendor/defaults/setting';
import SETTING from 'bsrs-ember/vendor/setting_fixtures';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, setting;

module('unit: setting attrs', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting']);
    }
});

test('test dirty tracking on tracked settings', (assert) => {
    setting = store.push('setting', SETTING.detail());
    assert.equal(setting.get('welcome_text'), SETTING_DEFAULTS.welcome_text);
    assert.ok(setting.get('isNotDirty'));
    setting.set('welcome_text', 'ABC124');
    assert.ok(setting.get('isDirty'));
    setting.set('welcome_text', SETTING_DEFAULTS.welcome_text);
    assert.ok(setting.get('isNotDirty'));
});
