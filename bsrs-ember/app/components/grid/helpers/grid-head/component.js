import Ember from 'ember';
import UpdateFind from 'bsrs-ember/mixins/update-find';
import inject from 'bsrs-ember/utilities/inject';
import SaveFiltersetMixin from 'bsrs-ember/mixins/components/grid/save-filterset';

export default Ember.Component.extend(UpdateFind, SaveFiltersetMixin, {
  simpleStore: Ember.inject.service(),
  mobileFilter: false,
  mobileSearch: false,
  showSaveFilterInput: false,
  filtersetName: '',
  /*
  * object that holds key of type string ('location.name') and value of type string ('wat')
  * passed as a property to grid-header-column component
  */
  gridFilterParams: {},
  searchResults: [],
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
    //   this.toggleProperty('showSaveFilterInput');
    // },
    filterGrid() {
      this.toggleProperty('mobileFilter');
      /* shows input box in horizontal scroll of save filterset */
      this.toggleProperty('showSaveFilterInput');
      const params = this.get('gridFilterParams');
      const find = this.get('find');
      let finalFilter = '';
      Object.keys(params).forEach((key) => {
        finalFilter += this.update_find_query(key, params[key], find);
      });
      this.get('simpleStore').clear(`${this.get('noun')}-list`);
      this.setProperties({ page:1, find: finalFilter });
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
