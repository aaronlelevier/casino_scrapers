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
