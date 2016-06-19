import Ember from 'ember';
import UpdateFind from 'bsrs-ember/mixins/update-find';

export default Ember.Component.extend(UpdateFind, {
  simpleStore: Ember.inject.service(),
  mobileFilter: false,
  mobileSearch: false,
  /*
  * object that holds key of type string ('location.name') and value of type string ('wat')
  * passed as a property to grid-header-column component
  */
  gridFilterParams: {},
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    /*
    * MOBILE - Need to see how Ember modularization RFC pans out.  Same component functions duplicated right now
    */
    keyup(searchValue) {
      this.get('simpleStore').clear(`${this.get('noun')}-list`);
      this.setProperties({ page:1, search: searchValue });
    },
    filterGrid() {
      this.toggleProperty('mobileFilter');
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
