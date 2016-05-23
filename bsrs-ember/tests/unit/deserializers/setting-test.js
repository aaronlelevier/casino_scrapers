import Ember from 'ember';
import {test, module} from 'bsrs-ember/tests/helpers/qunit';
import module_registry from 'bsrs-ember/tests/helpers/module_registry';
import SD from 'bsrs-ember/vendor/defaults/setting';
import SF from 'bsrs-ember/vendor/setting_fixtures';
import SettingDeserializer from 'bsrs-ember/deserializers/setting';

var store, setting, run = Ember.run, deserializer;

module('unit: settings deserializer test', {
    beforeEach() {
        store = module_registry(this.container, this.registry, ['model:setting', 'service:i18n']);
        deserializer = SettingDeserializer.create({simpleStore: store});
        run(()=>{
            setting = store.push('setting', {id: SD.id, name: SD.name});
        });
    }
});

test('setting correctly deserialized settings object', (assert) => {
    let json = SF.detail();
    run(()=>{
        deserializer.deserialize(json, SD.id);
    });
    assert.equal(setting.get('dashboard_text'), SD.dashboard_text);
    assert.equal(setting.get('login_grace'), SD.login_grace);
    assert.equal(setting.get('company_name'), SD.company_name);
assert.notOk(setting.get('settings'));
});
