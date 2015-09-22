import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend({
    type: Ember.computed(function() { return 'category'; }),
    url: Ember.computed(function() { return CATEGORY_URL; }),
    CategoryDeserializer: inject('category'),
    deserializer: Ember.computed.alias('CategoryDeserializer'),
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
    findCategoryChildren(search) {
        let url = CATEGORY_URL;
        search = search ? search.trim() : search;
        if (search) {
            url += '?search=' + search;
            PromiseMixin.xhr(url, 'GET').then((response) => {
                this.get('CategoryDeserializer').deserialize(response);
            });
            return this.get('store').find('category');
        }
    },
    find() {
        PromiseMixin.xhr(CATEGORY_URL, 'GET').then((response) => {
            this.get('CategoryDeserializer').deserialize(response);
        });
        return this.get('store').find('category');
    },
    findWithQuery(page, sort, search, find) {
        page = page || 1;
        var endpoint = CATEGORY_URL + '?page=' + page; //TODO: make url consistent in all repos
        if (sort && sort !== 'id') {
            endpoint = endpoint + '&ordering=' + sort;
        }
        if (search && search !== '') {
            endpoint = endpoint + '&search=' + encodeURIComponent(search);
        }
        if (find && find !== '') {
            let finds = find.split(',');
            finds.forEach(function(data) {
                let params = data.split(':');
                let key = params[0];
                let value = params[1];
                endpoint = endpoint + '&' + key + '__icontains=' + encodeURIComponent(value);
            });
        }
        var all = this.get('store').find('category');
        PromiseMixin.xhr(endpoint).then((response) => {
            all.set('isLoaded', true);
            all.set('count', response.count);
            this.get('CategoryDeserializer').deserialize(response); //TODO: remove this ?
        });
        return all;
    },
    findById(id) {
        PromiseMixin.xhr(CATEGORY_URL + id + '/', 'GET').then((response) => {
            this.get('CategoryDeserializer').deserialize(response, id);
        });
        return this.get('store').find('category', id);
    },
    delete(id) {
       PromiseMixin.xhr(CATEGORY_URL + id + '/', 'DELETE');
       this.get('store').remove('category', id);
    },
});

export default CategoryRepo;
