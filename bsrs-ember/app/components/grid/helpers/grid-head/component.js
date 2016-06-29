import Ember from 'ember';
import UpdateFind from 'bsrs-ember/mixins/update-find';
import inject from 'bsrs-ember/utilities/inject';
import SaveFiltersetMixin from 'bsrs-ember/mixins/components/grid/save-filterset';

export default Ember.Component.extend(UpdateFind, SaveFiltersetMixin, {
  simpleStore: Ember.inject.service(),
  init() {
    this._super(...arguments);
    /* @property gridFilterParams
    * object that holds key of type string ('location.name') and value of type string ('wat')
    * passed as a property to grid-header-column component
    */
    this.gridFilterParams = {};
    /* @property gridIdInParams
    * used for model specific searches where request url will look like location__id__in=x,x,x
    * object that holds key of type string ('location.name') and pipe separated ids
    */
    this.gridIdInParams = {};
    this.filtersetName = '';
    this.mobileFilter = false;
    this.mobileSearch = false;
    this.showSaveFilterInput = false;
    this.searchResults = [];
  },
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    /*
    * MOBILE - Need to see how Ember modularization RFC pans out.  Same component functions duplicated right now
    */
    /* @method keyup
    * asks repository for raw results
    */
    keyup(searchValue) {
      const repo = this.get('repository');
      repo.mobileSearch(searchValue).then((results) => {
        this.set('searchResults', results);
      });
      // this.setProperties({ page:1, search: searchValue });
    },
    // searchGrid() {
      // this.toggleProperty('showSaveFilterInput');
    // },
    /*
    * @method filterGrid
    * takes gridFilterParams && gridIdInParams object and turns values into a string
    */
    filterGrid() {
      this.toggleProperty('mobileFilter');
      /* shows input box in horizontal scroll of save filterset */
      this.toggleProperty('showSaveFilterInput');
      /* find query param */
      const params = this.get('gridFilterParams');
      const find = this.get('find');
      let finalFilter = '';
      Object.keys(params).forEach((key) => {
        finalFilter += this.update_find_query(key, params[key], find);
      });
      this.get('simpleStore').clear(`${this.get('noun')}-list`);
      /* id_in query param is pipe separated model types, comma separated list of model's ids that were filtered */
      const idInParams = this.get('gridIdInParams');
      let finalIdInFilter = '';
      Object.keys(idInParams).forEach((key) => {
        const arrIds = idInParams[key];
        finalIdInFilter += (key.split('.')[0] + ':' + arrIds.reduce((prev, id) => {
          return prev += `${id},`;
        }, '') + '|');
      });
      /* savefilterset will append id_in for endpoint_uri if blank ?? */
      if (!finalIdInFilter) finalIdInFilter = undefined;
      this.setProperties({ page:1, find: finalFilter, id_in: finalIdInFilter });
    },
    toggleMobileSearch() {
      this.toggleProperty('mobileSearch');
    },
    toggleMobileFilter() {
      this.toggleProperty('mobileFilter');
    },
    toggleFilterModal(column) {
      this.toggle(column);
    },
  }
});
