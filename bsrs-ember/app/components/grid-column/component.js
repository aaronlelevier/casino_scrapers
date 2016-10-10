import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'th',
    filterClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        column = column.replace('.', '-');
        return `t-filter-${column}`;
    }),
    sortClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        column = column.replace('.', '-');
        return `t-sort-${column}`;
    }),
    sortByClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        column = column.replace('.', '-');
        return `t-sort-${column}-dir`;
    }),
    actions: {
        sortBy(column) {
            this.get('sortBy')(column);
        },
        toggleFilterModal(column) {
            this.get('toggleFilterModal')(column);
        }
    }
});
