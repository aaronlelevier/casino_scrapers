import Ember from 'ember';
const { run } = Ember;
import config from 'bsrs-ember/config/environment';
import UpdateFind from 'bsrs-ember/mixins/update-find';
import SaveFiltersetMixin from 'bsrs-ember/mixins/components/grid/save-filterset';

export default Ember.Component.extend(UpdateFind, SaveFiltersetMixin, {
  simpleStore: Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.filtersetName = '';
    this.mobileFilter = false;
    this.mobileSearch = false;
    this.showSaveFilterInput = false;
    this.searchResults = [];
  },
  slideOutDown: false,
  slideInUp: true,

  actions: {
    linkToNew(add_model_url) {
      this.get('linkToNew')(add_model_url);
    },
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    /** 
     * @method export
     * takes no params and sends command to repository
     */
    exportGrid(){
      this.get('exportGrid')();
    },

    /**
     * MOBILE - Need to see how Ember modularization RFC pans out.  Same component functions duplicated right now
     * EVERYTHING BELOW
     */

    /**
     * @method keyup
     * asks repository for raw results w/ 'search' query param
     */
    keyup(searchValue) {
      const repo = this.get('repository');
      repo.mobileSearch(searchValue).then((results) => {
        this.set('searchResults', results);
      });
      // this.setProperties({ page:1, search: searchValue });
    },
    /*
    // searchGrid() {
    // this.toggleProperty('showSaveFilterInput');
    // },
    /*
     * @method filterGrid
     * takes gridFilterParams && gridIdInParams object and turns values into a string
     * calls grid route model hook after find or id_in are set
     */
    filterGrid() {
      this.toggleProperty('mobileFilter');
      /* shows input box in horizontal scroll of save filterset */
      this.toggleProperty('showSaveFilterInput');

      /* 'find' query param */
      const find = this.get('find');
      const gridFilterParams = this.get('gridFilterParams');
      let finalFilter = '';
      Object.keys(gridFilterParams).forEach((key) => {
        finalFilter += this.update_find_query(key, gridFilterParams[key], find, finalFilter);
      });

      /* 'id_in' query param - pipe separated model types, comma separated list of model's ids that were filtered */
      const idInParams = this.get('gridIdInParams');
      let finalIdInFilter = '';
      /* loop through keys in gridIdInParams object > status.translated_name:['12493-adv32...'],location.name:[obj, obj] */
      Object.keys(idInParams).forEach((key) => {
        const arrVals = idInParams[key];
        if (arrVals.length === 0) {
          // delete key if user set to none
          delete idInParams[key];
        }
        finalIdInFilter += (key.split('.')[0] + ':' + arrVals.reduce((prev, val) => {
          val = typeof(val) === 'object' ? val.id : val;
          return prev += `${val},`;
        }, '') + '|');
      });

      // enter if block if initial state or reset or query params had previous values that were removed
      if (!finalFilter && !finalIdInFilter) {
        // if initial state, do not reset grid and keep local cache of grid data
        if (typeof find === 'undefined' && typeof id_in === 'undefined') { return; }
        // if find or id_in had previous values, reset grid and clear store in anticipation of new data
        this.get('simpleStore').clear(`${this.get('noun')}-list`);
        this.setProperties({page: 1, find: undefined, id_in: undefined});
      } else {
        this.get('simpleStore').clear(`${this.get('noun')}-list`);
        this.setProperties({ page: 1, find: finalFilter, id_in: finalIdInFilter });
      }
    },
    toggleMobileSearch() {
      this.setProperties({slideInUp: true, slideOutDown: false});
      this.toggleProperty('mobileSearch');
    },
    toggleMobileFilter() {
      this.setProperties({slideInUp: true, slideOutDown: false});
      this.toggleProperty('mobileFilter');
    },
    toggleFilterModal(column) {
      this.toggle(column);
    },
    closeMobileFilter() {
      this.setProperties({slideInUp: false, slideOutDown: true});
      run.later(this, 'send', 'toggleMobileFilter', config.APP.ANIMATION_TIME);
    },
    closeMobileSearch() {
      this.setProperties({slideInUp: false, slideOutDown: true});
      run.later(this, 'send', 'toggleMobileSearch', config.APP.ANIMATION_TIME);
    }
  }
});
