import Ember from 'ember';
const { get, set } = Ember;
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';
import inject from 'bsrs-ember/utilities/inject';
import { ServerError } from 'bsrs-ember/utilities/errors';

var nameRoute = function(route) {
  return route.get('constructor.ClassMixin.ownerConstructor').toString();
};

var GridViewRoute = Ember.Route.extend({
  device: Ember.inject.service('device/layout'),
  pagination: Ember.inject.service(),
  personCurrent: Ember.inject.service(),
  filtersetRepository: inject('filterset'),
  init() {
    /* MOBILE PROPERTIES - objects are needed to hold values until filter action is instantiated. No instant updating in mobile like we have in desktop */
    this._super(...arguments);
    /* @property gridFilterParams
    * object that holds key of type string ('location.name') and value of type string ('wat')
    * passed as a property to grid-header-column component
    */
    this.gridFilterParams = Ember.Object.create();
    /* @property gridIdInParams
    * used for model specific searches where request url will look like location__id__in=x,x,x
    * object that holds key of type string ('location.name') and pipe separated ids
    * for power selects, value is [obj, obj] b/c need to preserve object if return to filter
    */
    this.gridIdInParams = Ember.Object.create();
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
    ts: {
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
      this.controllerFor(routeName).set('infinityIsLoading', true);
      return new Ember.RSVP.Promise((resolve, reject) => {
        return repository.findWithQueryMobile(query.page, query.search, query.find, query.id_in, special_url).then((model) => {
          this.controllerFor(routeName).set('infinityIsLoading', false);
          resolve({ count, model, requested, filtersets, routeName, search, repository });
        });
      });
    } else {
      return new Ember.RSVP.Promise((resolve, reject) => {
        return repository.findWithQuery(query.page, query.search, query.find, query.id_in, query.page_size, query.sort, special_url).then((model) => {
          resolve({ count, model, requested, filtersets, routeName, search, repository });
        }, (xhr) => {
          if (xhr.status >= 400) {
            const err = xhr.responseJSON;
            const key = Object.keys(err);
            resolve( new ServerError(err[key[0]]) );
          }
        });
      });
    }
  },
  setupController: function(controller, hash) {
    if ( !(hash instanceof ServerError) )  {
      controller.setProperties(hash);
      controller.set('filterModel', this.filterModel);
      controller.set('gridFilterParams', this.gridFilterParams);
      controller.set('gridIdInParams', this.gridIdInParams);
    } else {
      controller.set('error', hash);
      // need to set model to empty array due to model state preserved in component.  Error shows in place of component
      controller.set('model', []);
    }
  },
  actions: {
    exportGrid(find, search, sort) {
      get(this, 'repository').exportGrid(find, search, sort);
    },
    /* @ method updateGridFilterParams
     * @param {object} column - 'description' or 'location.name'
     * @param {obj} val - e.g. location class or if gridFilterParams it is a string
     */
    updateGridFilterParams(column, val) {
      const fieldName = column.field.includes('.') ? column.field.split('.')[0] : column.field;
      if(column.multiple) {
        const gridIdInParams = get(this, 'gridIdInParams');
        const idArray = gridIdInParams[fieldName] || [];
        const indx = idArray.indexOf(val);
        if(indx > -1) {
          // Remove Checkbox
          idArray.splice(indx, 1);
        } else {
          // Add Checkbox
          set(gridIdInParams, fieldName, idArray.concat(val));
        }
      } else if (column.powerSelect) {
        // Power select
        const gridIdInParams = get(this, 'gridIdInParams');
        set(gridIdInParams, fieldName, val);
      } else {
        // Input item
        const gridFilterParams = get(this, 'gridFilterParams');
        set(gridFilterParams, column.field, val);
      }
    }
  }
});

export default GridViewRoute;
