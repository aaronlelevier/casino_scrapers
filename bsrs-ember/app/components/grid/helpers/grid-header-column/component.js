import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'th',
    classNameBindings: ['className'],
    className: Ember.computed(function() {
        let classNames = this.get('column.classNames') || [];
        return classNames.join(' ');
    }),
    actionClass: Ember.computed(function() {
        let className = this.get('column.actionClassName') || this.get('column.field') || 'invalid-field';
        className = className.replace('_', '-');
        className = className.replace(/\./g, '-');
        return className;
    }),
    sortClass: Ember.computed(function() {
        let isSortable = this.get('column.isSortable');
        let actionClass = this.get('actionClass');
        return isSortable ? `t-sort-${actionClass}` : '';
    }),
    sortByClass: Ember.computed(function() {
        let isSortable = this.get('column.isSortable');
        let actionClass = this.get('actionClass');
        return isSortable ? `fa t-sort-${actionClass}-dir` : '';
    }),
    filterClass: Ember.computed(function() {
        let isFilterable = this.get('column.isFilterable');
        let actionClass = this.get('actionClass');
        return isFilterable ? `fa fa-filter t-filter-${actionClass}` : '';
    }),
    actions: {
        sortBy(field) {
            this.attrs.sortBy(field);
        },
        toggleFilterModal(field) {
            this.attrs.toggleFilterModal(field);
        }
    }
});
