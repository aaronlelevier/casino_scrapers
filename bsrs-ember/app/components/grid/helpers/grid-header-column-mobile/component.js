import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: ['className'],
  mobileFilterInput: false,
  init(){
    const existingFilter = this.get('gridFilterParams')[this.get('column')];
    if(existingFilter){
      this.set('initialVal', existingFilter);
      this.set('mobileFilterInput', true);
    }
    this._super(...arguments);
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
  * @return {string} - fa icone && test class
  */
  filterClass: Ember.computed(function() {
    let isFilterable = this.get('column.isFilterable');
    let actionClass = this.get('actionClass');
    return isFilterable ? `fa fa-filter t-filter-${actionClass}` : '';
  }),
  actions: {
    toggleMobileFilterInput(){
      this.toggleProperty('mobileFilterInput');
    },
    updateGridFilterParams(val){
      const column = this.get('column');
      const gridFilterParams = this.get('gridFilterParams');
      gridFilterParams[column.field] = val;
    }
  }
});