import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend({
    insert(model) {
        return PromiseMixin.xhr(CATEGORY_URL, 'POST', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });
    },
    update(model) {
        return PromiseMixin.xhr(CATEGORY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
        });   
    },
    find() {
        PromiseMixin.xhr(CATEGORY_URL + 'index/', 'GET').then((response) => {
            response.results.forEach((category) => {
                var cat = this.get('store').push('category', category);
                cat.save();
            });
        });
        return this.get('store').find('category');
    },
    findById(id) {
        PromiseMixin.xhr(CATEGORY_URL + id + '/', 'GET').then((response) => {
            this.get('store').push('category', response);
        });
        return this.get('store').find('category', id);
    }
});

export default CategoryRepo;
