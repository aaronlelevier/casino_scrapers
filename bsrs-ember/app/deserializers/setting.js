import Ember from 'ember';

var SettingDeserializer = Ember.Object.extend({
    deserialize(response, id) {
        let store = this.get('simpleStore');
        let existing_setting = store.find('setting', id);
        if (!existing_setting.get('id') || existing_setting.get('isNotDirtyOrRelatedNotDirty')) {
            for (var key in response.settings) {
                response[key] = response.settings[key].value;
            }
            delete response.settings;
            let setting = store.push('setting', response);
            setting.save();
        }
    }
});

export default SettingDeserializer;
