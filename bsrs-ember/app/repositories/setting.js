import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';

const { run } = Ember;
var PREFIX = config.APP.NAMESPACE;
var SETTING_URL = PREFIX + '/admin/tenant/';

export default Ember.Object.extend({
    SettingDeserializer: inject('setting'),
    deserializer: Ember.computed.alias('SettingDeserializer'),
    find() {
        let store = this.get('simpleStore');
        let model = store.findOne('setting');
        PromiseMixin.xhr(SETTING_URL + 'get/', 'GET').then((response) => {
            this.get('SettingDeserializer').deserialize(response, response.id);
        });
        return model;
    },
    update(model) {
        return PromiseMixin.xhr(SETTING_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
});
