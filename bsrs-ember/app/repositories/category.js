import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = PREFIX + '/admin/categories/';

var CategoryRepo = Ember.Object.extend(GridRepositoryMixin, {
    type: Ember.computed(function() { return 'category'; }),
    typeGrid: Ember.computed(function() { return 'category-list'; }),
    garbage_collection: Ember.computed(function() { return ['category-list']; }),
    url: Ember.computed(function() { return CATEGORY_URL; }),
    uuid: injectUUID('uuid'),
    CategoryDeserializer: inject('category'),
    deserializer: Ember.computed.alias('CategoryDeserializer'),
    update(model) {
        return PromiseMixin.xhr(CATEGORY_URL + model.get('id') + '/', 'PUT', {data: JSON.stringify(model.serialize())}).then(() => {
            model.save();
            model.saveRelated();
        });   
    },
    findCategoryChildren(search) {
        let url = CATEGORY_URL;
        search = search ? search.trim() : search;
        if (search) {  
            url += `?name__icontains=${search}&page_size=25`;
            return PromiseMixin.xhr(url, 'GET').then((response) => {
                return response.results.filter((category) => {
                    return category.name.toLowerCase().indexOf(search.toLowerCase()) > -1;
                });
            });
        }
    },
    // find() {
    //     PromiseMixin.xhr(CATEGORY_URL, 'GET').then((response) => {
    //         this.get('CategoryDeserializer').deserialize(response);
    //     });
    //     return this.get('store').find('category');
    // },
    findById(id) {
        // let model = this.get('store').find('category', id);
        // //return id right away to allow for tabs to be pushed into store with correct id 
        // model.id = id;
        return PromiseMixin.xhr(CATEGORY_URL + id + '/', 'GET').then((response) => {
            return this.get('CategoryDeserializer').deserialize(response, id);
        });
        // return model;
    },
});

export default CategoryRepo;
