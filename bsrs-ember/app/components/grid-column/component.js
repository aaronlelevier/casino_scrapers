import Ember from 'ember';

export default Ember.Component.extend({
    tagName: 'th',
    filterClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        return `t-filter-${column}`;
    }),
    sortClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        return `t-sort-${column}`;
    }),
    sortByClass: Ember.computed(function() {
        let column = this.get('column').replace('_', '-');
        return `t-sort-${column}-dir`;
    }),
    actions: {
        sortBy: function(column) {
            this.sendAction('sortBy', column);
        },
        toggleFilterModal: function(column) {
            this.sendAction('toggleFilterModal', column);
        }
    }
});
