import Ember from 'ember';
import SortBy from 'bsrs-ember/mixins/sort-by';

export default Ember.Component.extend(SortBy, {
  mobileSortFilter: false,
  mobileSearch: false,
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    toggleMobileSearch() {
      this.toggleProperty('mobileSearch');
    },
    toggleMobileSortFilter() {
      this.toggleProperty('mobileSortFilter');
    },
    /*
    * MOBILE - Need to see how Ember modularization RFC pans out.  Same component functions duplicated right now
    */
    /*
    * @method sortBy - passed down to grid-header-column component
    * set query param for page and sort, thus re-firing grid route
    */
    sortBy(column) {
      const current = this.get('sort');
      const sorted = this.reorder(current, column);
      this.setProperties({page: 1, sort: sorted});
    },
    toggleFilterModal(column) {
      this.toggle(column);
    },
  }
});
