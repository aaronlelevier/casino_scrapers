import Ember from 'ember';
import config from 'bsrs-ember/config/environment';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/components/grid/repository';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import findByName from 'bsrs-ember/utilities/find-by-name';

var PREFIX = config.APP.NAMESPACE;
var CATEGORY_URL = `${PREFIX}/admin/categories/`;

var CategoryRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
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
    return findByName(url, search, 25);
  },
});

export default CategoryRepo;
