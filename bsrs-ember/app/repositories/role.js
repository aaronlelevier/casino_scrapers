import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var ROLE_URL = '/admin/roles/';

var RoleRepo = Ember.Object.extend({
    RoleDeserializer: inject('role'),
    insert(model) {
        return PromiseMixin.xhr(PREFIX + ROLE_URL, 'POST', { data: JSON.stringify(model.serialize()) }).then(() => {
           model.save(); 
        });
    },
    update(model) {
        return PromiseMixin.xhr(PREFIX + ROLE_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())} ).then(() => {
            model.save();
        });
    },
    find() {
        PromiseMixin.xhr(PREFIX + ROLE_URL, 'GET').then((response) => {
            this.get('RoleDeserializer').deserialize(response);
        });
        return this.get('store').find('role');
    },
    findById(id) {
        PromiseMixin.xhr(PREFIX + ROLE_URL + id + '/', 'GET').then((response) => {
            this.get('RoleDeserializer').deserialize(response, id);
        });
        return this.get('store').find('role', id);
    }
});

export default RoleRepo;
