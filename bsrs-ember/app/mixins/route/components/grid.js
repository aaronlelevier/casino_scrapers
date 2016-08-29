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
    /* MOBILE PROPERTIES */
    this._super(...arguments);
    /* @property gridFilterParams
    * object that holds key of type string ('location.name') and value of type string ('wat')
    * passed as a property to grid-header-column component
    */
    this.gridFilterParams = {};
    /* @property gridIdInParams
    * used for model specific searches where request url will look like location__id__in=x,x,x
    * object that holds key of type string ('location.name') and pipe separated ids
    * for power selects, value is [obj, obj] b/c need to preserve object if return to filter
    */
    this.gridIdInParams = {};
    /*
     * @property {obj} filterModel
     * object that holds 'find' query state
    */
    this.filterModel = Ember.Object.create();
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
        return repository.findWithQueryMobile(query.page, query.search, query.find, query.id_in, special_url).then((model) => {
          resolve({ count, model, requested, filtersets, routeName, search, repository });
        });
      });
    } else {
      return new Ember.RSVP.Promise((resolve, reject) => {
        return repository.findWithQuery(query.page, query.search, query.find, query.id_in, query.page_size, query.sort, special_url).then((model) => {
          resolve({ count, model, requested, filtersets, routeName, search, repository });
        });
      });
    }
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
    controller.set('filterModel', this.filterModel);
    controller.set('gridFilterParams', this.gridFilterParams);
    controller.set('gridIdInParams', this.gridIdInParams);
  },
  actions: {
    exportGrid(find, search, sort) {
      this.get('repository').exportGrid(find, search, sort);
    }
  }
});

export default GridViewRoute;
