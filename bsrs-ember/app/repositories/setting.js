import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';

var run = Ember.run;
var PREFIX = config.APP.NAMESPACE;
var SETTING_URL = PREFIX + '/admin/settings/';

export default Ember.Object.extend({
    findById(id) {
        let store = this.get('store');
        let model = store.find('setting', id);
        model.id = id;
        PromiseMixin.xhr(SETTING_URL + id + '/', 'GET').then((response) => {
            store.push('setting', response);
        });
        return model;
    }
});
