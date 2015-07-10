import Ember from 'ember';
import config from 'bsrs-ember/config/environment';

var API_HOST = config.APP.API_HOST;
var NAMESPACE = config.APP.NAMESPACE;

export default Ember.Object.extend({
    find: function() {
        var prefix = API_HOST + '/' + NAMESPACE;
        var store = this.get('store');
        $.ajax({
            url: prefix + '/states/'
        }).then(function(response) {
            Ember.run(function() {
                response.forEach(function(model) {
                    store.push("state", model);
                });
            });
        });
        return store.find("state");
    }
});
