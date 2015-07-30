import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;

var create_role_with_relationships = (response, store, id) => {
    response.categories.forEach((category) => {
        category.role_id = id;
        store.push('category', category);
    });
    delete response.categories;
    var originalRole = store.push('role', response);
    originalRole.save();
};

export default Ember.Object.extend({
    update(model) {
        // var payload = {data: JSON.stringify({
        //    id: model.get('id'),
        //    name: model.get('name'),
        //    location_level: model.get('location_level'),
        //    category: model.get('category')
        // })};
        return PromiseMixin.xhr(PREFIX + '/admin/roles/' + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())} ).then(() => {
            model.save();
        });
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
            create_role_with_relationships(response, store, id);
        });
        return store.find('role', id);
    }
});
