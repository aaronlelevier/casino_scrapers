import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    save(model) {
        var endpoint = PREFIX + '/admin/roles/' + model.get('id') + '/';
        var store = this.get('store');
        var payload = {
           'id': model.get('id'),
           'name': model.get('name')
        };
        return $.ajax({
            url: endpoint,
            data: payload,
            method: 'PUT'
        });
    },
    find() {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/roles/', 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push('role', model);
            });
        });
        return store.find("role");
    },
    findById(id) {
        var endpoint = PREFIX + '/admin/roles/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then((response) => {
            Ember.run(() => {
                store.push("role", response);
            });
        });
        return store.find("role", id);
    }
});
