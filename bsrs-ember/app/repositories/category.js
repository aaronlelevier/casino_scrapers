import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend({
    find() {
        PromiseMixin.xhr(CATEGORY_URL + 'index/', 'GET').then((response) => {
            response.results.forEach((category) => {
                this.get('store').push('category', category);
            });
        });
        return this.get('store').find('category');
    },
});

export default CategoryRepo;
