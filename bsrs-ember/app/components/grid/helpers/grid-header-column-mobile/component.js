import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['className', 'mobileFilterInput'],
  mobileFilterInput: false,
  init(){
    this._super(...arguments);
    this.mobileFilterInput = false;
    //TODO: need to do for gridFilterParams as well
    const existingFilter = this.get('gridIdInParams')[this.get('column.field')];
    if(existingFilter){
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
  * converts priority.translated_name to priority-translated-name
  */
  actionClass: Ember.computed(function() {
    let className = this.get('column.actionClassName') || this.get('column.field') || 'invalid-field';
    className = className.replace('_', '-');
    className = className.replace(/\./g, '-');
    return className;
  }),
  /*
  * @method filterClass
  * @param actionClass - e.g. priority-translated-name
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
    */
    updateGridFilterParams(val) {
      const column = this.get('column');
      if(column.multiple) {
        const gridIdInParams = this.get('gridIdInParams');
        if(gridIdInParams[column.field]) {
          gridIdInParams[column.field] = gridIdInParams[column.field].concat(val).uniq();
        } else {
          gridIdInParams[column.field] = [val];
        }
      } else {
        const gridFilterParams = this.get('gridFilterParams');
        gridFilterParams[column.field] = val;
      }
    }
  }
});
