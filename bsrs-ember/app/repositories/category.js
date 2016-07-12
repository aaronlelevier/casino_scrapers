import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import BaseRepository from 'bsrs-ember/repositories/base-repo';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = `${PREFIX}/admin/categories/`;

var CategoryRepo = BaseRepository.extend({
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
    if (search) {
      // DT New
      url += `category__icontains=${search}/`;
      return PromiseMixin.xhr(url, 'GET').then((response) => {
        return response;
      });
    }
  },
});

export default CategoryRepo;
