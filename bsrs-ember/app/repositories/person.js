import Ember from 'ember';
import config from 'bsrs-ember/config/environment'; 

var API_HOST = config.APP.API_HOST;
var NAMESPACE = config.APP.NAMESPACE;

export default Ember.Object.extend({
    save: function(model) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/people/' + model.get('id') + '/';
        var store = this.get('store');
        var payload = {
           'id': model.get('id'),
           'username': model.get('username'),
           'first_name': model.get('first_name'),
           'last_name': model.get('last_name'),
           'title': model.get('title'),
           'emp_number': model.get('emp_number'),
           'auth_amount': model.get('auth_amount')
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
            url: prefix + '/admin/people/'
        }).then(function(response) {
            Ember.run(function() {
                response.results.forEach(function(model) {
                    store.push("person", model);
                });
            });
        });
        return store.find("person");
    },
    findById: function(id) {
        var prefix = API_HOST + '/' + NAMESPACE;
        var endpoint = prefix + '/admin/people/' + id + '/';
        var store = this.get('store');
        $.ajax({
            url: endpoint
        }).then(function(response) {
            Ember.run(function() {
                store.push("person", response);
            });
        });
        return store.find("person", id);
    }
});
