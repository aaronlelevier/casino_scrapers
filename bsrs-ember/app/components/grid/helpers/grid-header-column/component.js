import Ember from 'ember';

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: 'th',
  /* accessibility */
  scope: 'col',
  colspan: 1,
  attributeBindings: ['colspan', 'style', 'dataTestId:data-test-id', 'scope'],
  classNameBindings: ['className'],
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
  * @method sortClass
  * used only in displaying column.field
  */
  sortClass: Ember.computed(function() {
    let isSortable = this.get('column.isSortable');
    let actionClass = this.get('actionClass');
    return isSortable ? `title t-sort-${actionClass}` : '';
  }),
  /*
  * @method sortByClass
  * @param actionClass - e.g. priority-name
  * @return {string} - fa (first part of putting a fa-icon in template from query-param-asc helper)
  * && test class
  */
  sortByClass: Ember.computed(function() {
    let isSortable = this.get('column.isSortable');
    let actionClass = this.get('actionClass');
    return isSortable ? `fa t-sort-${actionClass}-dir` : '';
  }),
  /*
  * @method filterClass
  * @param actionClass - e.g. priority-name
  * @return {string} - fa icone && test class
  */
  filterClass: Ember.computed(function() {
    let isFilterable = this.get('column.isFilterable');
    let actionClass = this.get('actionClass');
    return isFilterable ? `fa fa-filter t-filter-${actionClass}` : '';
  }),
  actions: {
    sortBy(field) {
      this.get('sortBy')(field);
    },
    toggleFilterModal() {
      // if(this.get('column.headerIsTranslatable')){
      //     placeholder = this.get('i18n').t(placeholder);
      // }
      this.get('toggleFilterModal')();
    }
  }
});
