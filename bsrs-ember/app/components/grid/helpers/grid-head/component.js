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
    }
  }
});
