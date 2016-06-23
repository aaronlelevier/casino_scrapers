import Ember from 'ember';

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  classNames: ['t-checkbox-list'],
  filterModels: Ember.computed(function() {
    const field = this.get('column.filterModelName');
    const store = this.get('simpleStore');
    return store.find(field);
  }),
  actions: {
    /*  @method updateCheckbox
    * closure action sent up to grid-header-column-mobile
    * @param {string} column_field - un translated value ex// ticket.priority.emergency
    */
    updateCheckbox(column_field) {
      this.attrs.updateGridFilterParams(column_field);
    },
  }
});
