import Ember from 'ember';
const { get, set } = Ember;
import set_filter_model_attrs from 'bsrs-ember/utilities/filter-model-attrs';
import inject from 'bsrs-ember/utilities/inject';
import { ClientError } from 'bsrs-ember/utilities/errors';

let nameRoute = function(route) {
  return route.get('constructor.ClassMixin.ownerConstructor').toString();
};

let GridViewRoute = Ember.Route.extend({
  device: Ember.inject.service('device/layout'),
  pagination: Ember.inject.service(),
  personCurrent: Ember.inject.service('person-current'),
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
    }
  },
  model(params, transition) {
    const { filtersetRepository, repository, special_url, routeName } = this.getProperties('filtersetRepository', 'repository', 'special_url', 'routeName');
    const filtersets = filtersetRepository.fetch();
    const name = nameRoute(this);
    const query = transition.queryParams;
    const page = parseInt(query.page, 10) || 1;
    const requested = this.get('pagination').requested(name, page);
    const search = query.search;
    set_filter_model_attrs(this.filterModel, query.find);
    return new Ember.RSVP.Promise((resolve, reject) => {
      let queryMethod, args, callback;
      if (this.get('device').get('isMobile')) {
        queryMethod = repository.findWithQueryMobile;
        args = [
          query.page, query.search, query.find, query.id_in, special_url
        ];
        this.controllerFor(routeName).set('infinityIsLoading', true);
        callback = (/*model*/) => {
          this.controllerFor(routeName).set('infinityIsLoading', false);
        };
      } else {
        queryMethod = repository.findWithQuery;
        args = [
          query.page, query.search, query.find, query.id_in,
          query.page_size, query.sort, special_url
        ];
      }
      return queryMethod.apply(repository, args)
      .then((model) => {
        if (typeof callback === 'function') {
          callback.call(this, model);
        }
        resolve({ model, requested, filtersets, routeName, search, repository });
      })
      .catch((xhr) => {
        let msg;
        try {
          msg = xhr.responseJSON[Object.keys(xhr.responseJSON)[0]];
        } catch(e) {
          Ember.Logger.debug(e);
          msg = null;
        }
        if ([401,403].includes(xhr.status)) {
          reject( new ClientError(msg, 'error', xhr) );
        } else if (xhr.status >= 400) {
          // use main or admin error substate
          reject( new ClientError(msg, 'error', xhr) );
        }
      });
    });
  },
  setupController: function(controller, hash) {
    if ( !(hash instanceof Error) )  {
      controller.setProperties(hash);
      controller.set('filterModel', this.filterModel);
      controller.set('gridFilterParams', this.gridFilterParams);
      controller.set('gridIdInParams', this.gridIdInParams);
    } else {
      controller.set('error', hash);
      // need to set model to empty array due to model state preserved in component.  Error shows in place of component
      const model_array = controller.set('model', []);
      model_array.set('isLoaded', true);
      // TODO: put lower down and set defaults or set here?
      controller.set('filtersets', []);
      controller.set('requested', []);
    }
    // grid-loading-graphic
    set(controller, 'isLoading', undefined);
    
    // set doc title, but if error, no model
    if (hash.model) {
      this.set('tabTitleCount', hash.model.get('length'));
    }
  },
  actions: {
    refresh() {
      this.refresh();
    },
    exportGrid(find, search, sort) {
      get(this, 'repository').exportGrid(find, search, sort);
    },
    /* @ method updateGridFilterParams
     * @param {object} column - 'description' or 'location.name'
     * @param {obj} val - e.g. location class or if gridFilterParams it is a string
     */
    updateGridFilterParams(type, column, val) {
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
      // clear store so that results are only from server
      this.get('functionalStore').clear(type);
    },
    linkToNew(url) {
      const count = this.get('repository').findCount(); 
      this.transitionTo(url, count);
    }
  }
});

export default GridViewRoute;
