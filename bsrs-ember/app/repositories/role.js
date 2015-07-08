import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var API_HOST = config.APP.API_HOST;
var NAMESPACE = config.APP.NAMESPACE;

export default Ember.Object.extend({
    save: function(model) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/roles/' + model.get('id') + '/';
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
    find: function() {
        var prefix = API_HOST + '/' + NAMESPACE;
        var store = this.get('store');
        $.ajax({
            url: prefix + '/admin/roles/'
        }).then(function(response) {
            Ember.run(function() {
                response.results.forEach(function(model) {
                    store.push("role", model);
                });
            });
        });
        return store.find("role");
    },
    findById: function(id) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/roles/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then(function(response) {
            Ember.run(function() {
                store.push("role", response);
            });
        });
        return store.find("role", id);
    }
});
