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
    assert.equal(setting.get('name'), SD.name);
    assert.equal(setting.get('title'), SD.title);
    assert.equal(setting.get('related_id'), SD.related_id);
    //settings
    assert.equal(setting.get('company_code'), SD.company_code);
    assert.equal(setting.get('company_name'), SD.company_name);
    assert.equal(setting.get('dashboard_text'), SD.dashboard_text);
    assert.equal(setting.get('login_grace'), SD.login_grace);
    assert.equal(setting.get('exchange_rates'), SD.exchange_rates);
    assert.equal(setting.get('modules'), SD.modules);
    assert.equal(setting.get('test_mode'), SD.test_mode);
    assert.equal(setting.get('test_contractor_email'), SD.test_contractor_email);
    assert.equal(setting.get('test_contractor_phone'), SD.test_contractor_phone);
    assert.equal(setting.get('dt_start_key'), SD.dt_start_key);
    // received settings object is destroyed after destructing
    assert.notOk(setting.get('settings'));
});
