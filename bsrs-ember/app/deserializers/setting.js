import Ember from 'ember';

var SettingDeserializer = Ember.Object.extend({
    deserialize(response, id) {
        let store = this.get('store');
        let existing_setting = store.find('setting', id);
        if (!existing_setting.get('id') || existing_setting.get('isNotDirtyOrRelatedNotDirty')) {
            response.welcome_text = response.settings.welcome_text.value;
            delete response.settings;
            let setting = store.push('setting', response);
            setting.save();
        }
    }
});

export default SettingDeserializer;
