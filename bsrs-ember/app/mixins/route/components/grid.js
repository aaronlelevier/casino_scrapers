import Ember from 'ember';
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';
import inject from 'bsrs-ember/utilities/inject';

var nameRoute = function(route) {
  return route.get('constructor.ClassMixin.ownerConstructor').toString();
};

var GridViewRoute = Ember.Route.extend({
  device: Ember.inject.service('device/layout'),
  pagination: Ember.inject.service(),
  personCurrent: Ember.inject.service(),
  filtersetRepository: inject('filterset'),
  init() {
    this.filterModel = Ember.Object.create();
    this._super();
  },
  queryParams: {
    page_size: {
      refreshModel: true
    },
    page: {
      refreshModel: true
    },
    sort: {
      refreshModel: true
    },
    find: {
      refreshModel: true
    },
    search: {
      refreshModel: true
    }
  },
  model(params, transition) {
    let filtersetRepository = this.get('filtersetRepository');
    let filtersets = filtersetRepository.fetch();
    let name = nameRoute(this);
    let query = transition.queryParams;
    let page = parseInt(query.page, 10) || 1;
    let repository = this.get('repository');
    let requested = this.get('pagination').requested(name, page);
    const search = query.search;
    const count = repository.findCount();
    const routeName = this.get('routeName');
    set_filter_model_attrs(this.filterModel, query.find);
    let model;
    if (this.get('device').get('isMobile')) {
      model = repository.findWithQueryMobile(query.page, query.search, query.find);
    } else {
      model = repository.findWithQuery(query.page, query.search, query.find, query.page_size, query.sort);
    }
    return {count, model, requested, filtersets, routeName, search};
  },
  setupController: function(controller, hash) {
    controller.set('count', hash.count);
    controller.set('model', hash.model);
    controller.set('requested', hash.requested);
    controller.set('filterModel', this.filterModel);
    controller.set('filtersets', hash.filtersets);
    controller.set('routeName', hash.routeName);
    controller.set('search', hash.search);
  }
});

export default GridViewRoute;
