import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

export default Ember.Object.extend({
    save(model) {
        var payload = {data: JSON.stringify({
           'id': model.get('id'),
           'name': model.get('name')
        })};
        return PromiseMixin.xhr(PREFIX + '/admin/roles/' + model.get('id') + '/', 'PUT', payload);
    },
    find() {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/roles/', 'GET').then((response) => {
            response.results.forEach((model) => {
                store.push('role', model);
            });
        });
        return store.find('role');
    },
    findById(id) {
        var store = this.get('store');
        PromiseMixin.xhr(PREFIX + '/admin/roles/' + id + '/', 'GET').then((response) => {
            store.push('role', response);
        });
        return store.find('role', id);
    }
});
