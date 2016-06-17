import Ember from 'ember';
import UpdateFind from 'bsrs-ember/mixins/update-find';

export default Ember.Component.extend(UpdateFind, {
  mobileFilter: false,
  mobileSearch: false,
  gridFilterParams: {},
  //THINK ABOUT PUTTING IN GRID_HEADER_COLUMN COMPONENT IF FIND IS NOT NEEDED HERE
  /*
  * object that holds key of type string ('location.name') and value of type string ('wat')
  * passed as a property to grid-header-column component
  gridFilterParams: {
    //EXAMPLE PROPERTIES//
    'location.name': 'wat',
    'assignee.fullname': 'scooter'
    'status.translated_name': 'scooter'
  }
  */
  actions: {
    toggleSaveFilterSetModal() {
      this.toggleProperty('savingFilter');
    },
    /*
    * MOBILE - Need to see how Ember modularization RFC pans out.  Same component functions duplicated right now
    */
    filterGrid() {
      this.toggleProperty('mobileFilter');
      const params = this.get('gridFilterParams');
      const find = this.get('find');
      let finalFilter = '';
      Object.keys(params).forEach((key) => {
        finalFilter += this.update_find_query(key, params[key], find);
      });
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
