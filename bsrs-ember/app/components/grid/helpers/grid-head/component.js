import Ember from 'ember';

export default Ember.Component.extend({
  mobileFilterset: false,
  mobileSortFilter: false,
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    toggleMobileFilterset() {
      this.toggleProperty('mobileFilterset');
      this.set('mobileSortFilter', false);
    },
    toggleMobileSortFilter() {
      this.toggleProperty('mobileSortFilter');
      this.set('mobileFilterset', false);
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
