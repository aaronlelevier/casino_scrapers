import Ember from 'ember';
const { get } = Ember;

export default Ember.Component.extend({
  simpleStore: Ember.inject.service(),
  classNames: ['t-checkbox-list'],
  filterModels: Ember.computed(function() {
    const field = this.get('column.filterModelName');
    const store = this.get('simpleStore');
    return store.find(field);
  }).readOnly(),
  /* @method field
   * @output {string} - right now assumes 'location.name' and not just 'description'...yet
   */
  field: Ember.computed(function() {
    return this.get('column.field').split('.')[0];
  }),
  actions: {
    /*  @method updateCheckbox
    * closure action sent up to grid-header-column-mobile
    * @param {string} column_field - un translated value ex// ticket.priority.emergency
    */
    updateCheckbox(column_field) {
      this.get('updateGridFilterParams')(get(this, 'column'), column_field);
    },
  },
  /* test classes START */
  classNameBindings: ['className'],
  className: Ember.computed(function() {
    return `t-checkbox-options-${this.get('column.classNames')}`;
  }),
  /* test classes END */
});
