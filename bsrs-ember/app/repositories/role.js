import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    save: function(model) {
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
        $.ajax({
            url: PREFIX + '/admin/roles/'
        }).then(function(response) {
            Ember.run(() => {
                response.results.forEach(function(model) {
                    store.push("role", model);
                });
            });
        });
        return store.find("role");
    },
    findById: function(id) {
        var endpoint = PREFIX + '/admin/roles/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then(function(response) {
            Ember.run(() => {
                store.push("role", response);
            });
        });
        return store.find("role", id);
    }
});
