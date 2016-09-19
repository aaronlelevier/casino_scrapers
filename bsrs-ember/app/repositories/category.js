import Ember from 'ember';
import PromiseMixin from 'ember-promise/mixins/promise';
import inject from 'bsrs-ember/utilities/deserializer';
import injectUUID from 'bsrs-ember/utilities/uuid';
import GridRepositoryMixin from 'bsrs-ember/mixins/repositories/grid';
import FindByIdMixin from 'bsrs-ember/mixins/repositories/findById';
import CRUDMixin from 'bsrs-ember/mixins/repositories/crud';
import findByName from 'bsrs-ember/utilities/find-by-name';
import { CATEGORIES_URL } from 'bsrs-ember/utilities/urls';

var CategoryRepo = Ember.Object.extend(GridRepositoryMixin, FindByIdMixin, CRUDMixin, {
  type: 'category',
  typeGrid: 'category-list',
  garbage_collection: ['category-list'],
  url: Ember.computed(function() { return CATEGORIES_URL; }),
  uuid: injectUUID('uuid'),
  CategoryDeserializer: inject('category'),
  deserializer: Ember.computed.alias('CategoryDeserializer'),
  findCategoryChildren(search) {
    let url = CATEGORIES_URL;
    if (search) {
      // DT New
      url += `category__icontains=${search}/`;
      return PromiseMixin.xhr(url, 'GET').then((response) => {
        return response.results;
      });
    }
  },
  findautomationCriteria(search) {
    if (search) {
      return PromiseMixin.xhr(`${CATEGORIES_URL}automation-criteria/${search}/`, 'GET').then((response) => {
        return response.results;
      });
    }
  }
});

export default CategoryRepo;
