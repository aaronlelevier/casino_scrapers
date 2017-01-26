import Ember from 'ember';
const { get } = Ember;

export default Ember.Component.extend({
  classNameBindings: ['className', 'mobileFilterInput'],
  mobileFilterInput: false,
  init(){
    this._super(...arguments);
    this.mobileFilterInput = false;
    const existingFilter = this.get('gridFilterParams')[this.get('column.field').split('.')[0]];
    const existingIdInObject = this.get('gridIdInParams')[this.get('column.field').split('.')[0]];
    if(existingFilter || (existingIdInObject && existingIdInObject.length)) {
      this.set('initialVal', existingFilter);
      this.set('mobileFilterInput', true);
    }
  },
  className: Ember.computed(function() {
    let classNames = this.get('column.classNames') || [];
    return classNames.join(' ');
  }),
  /*
  * @method actionClass
  * converts priority.name to priority-name
  */
  actionClass: Ember.computed(function() {
    let className = this.get('column.actionClassName') || this.get('column.field') || 'invalid-field';
    className = className.replace('_', '-');
    className = className.replace(/\./g, '-');
    return className;
  }),
  /*
  * @method filterClass
  * @param actionClass - e.g. priority-name
  * @return {string} - fa icon && test class
  */
  filterClass: Ember.computed(function() {
    let isFilterable = this.get('column.isFilterable');
    let actionClass = this.get('actionClass');
    return isFilterable ? `fa fa-filter t-filter-${actionClass}` : '';
  }),
  actions: {
    toggleMobileFilterInput() {
      this.toggleProperty('mobileFilterInput');
    },
    /* @method updategridIdInParams
    * @param {string} val - from input
    * column.field is the key that will go into update_find_query/update_id_in function in grid-head
    * route action in route/grid
    */
    updateGridFilterObj(val) {
      this.get('updateGridFilterParams')(get(this, 'column'), val);
    }
  }
});
