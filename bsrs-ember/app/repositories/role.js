import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;
var ROLE_URL = '/admin/roles/';

var create_role_with_relationships = (response, store, id) => {
    response.categories.forEach((category) => {
        category.role_id = id;
        store.push('category', category);
    });
    delete response.categories;
    var originalRole = store.push('role', response);
    originalRole.save();
};

var RoleRepo = Ember.Object.extend({
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
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + ROLE_URL, 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push('role', model);
            });
        });
        return store.find('role');
    },
    findById(id) {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + ROLE_URL + id + '/', 'GET').then((response) => {
            create_role_with_relationships(response, store, id);
        });
        return store.find('role', id);
    }
});

export default RoleRepo;
