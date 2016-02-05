import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import SETTING from 'bsrs-ember/vendor/defaults/setting';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';

let store, setting;

module('unit: setting', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting']);
    }
});

test('test generic attrs on the model', (assert) => {
    setting = store.push('setting', SETTING);
    assert.equal(setting.get('id'), SETTING.id);
    assert.equal(setting.get('name'), SETTING.name);
    assert.equal(setting.get('settings'), SETTING.settings);
});
