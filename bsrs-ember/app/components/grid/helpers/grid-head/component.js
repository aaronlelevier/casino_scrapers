import Ember from 'ember';

export default Ember.Component.extend({
  mobileSortFilter: false,
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
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
