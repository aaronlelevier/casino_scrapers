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
    },
    id_in: {
      refreshModel: true
    },
  },
  model(params, transition) {
    const { filtersetRepository, repository, special_url, routeName } = this.getProperties('filtersetRepository', 'repository', 'special_url', 'routeName');
    let filtersets = filtersetRepository.fetch();
    let name = nameRoute(this);
    let query = transition.queryParams;
    let page = parseInt(query.page, 10) || 1;
    let requested = this.get('pagination').requested(name, page);
    const search = query.search;
    const count = repository.findCount();
    set_filter_model_attrs(this.filterModel, query.find);
    let model;
    if (this.get('device').get('isMobile')) {
      return new Ember.RSVP.Promise((resolve, reject) => {
        repository.findWithQueryMobile(query.page, query.search, query.find, query.id_in, special_url).then((model) => {
          resolve({count, model, requested, filtersets, routeName, search, repository});
        });
      });
    } else {
      model = repository.findWithQuery(query.page, query.search, query.find, query.id_in, query.page_size, query.sort, special_url);
    }
    return {count, model, requested, filtersets, routeName, search};
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
    controller.set('filterModel', this.filterModel);
  }
});

export default GridViewRoute;
