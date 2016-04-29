import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var SETTING_URL = PREFIX + '/admin/settings/';

export default Ember.Object.extend({
    SettingDeserializer: inject('setting'),
    deserializer: Ember.computed.alias('SettingDeserializer'),
    findById(id) {
        let store = this.get('simpleStore');
        let model = store.find('setting', id);
        model.id = id;
        PromiseMixin.xhr(SETTING_URL + id + '/', 'GET').then((response) => {
            this.get('SettingDeserializer').deserialize(response, id);
        });
        return model;
    },
    update(model) {
        return PromiseMixin.xhr(SETTING_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
});
