import Ember from 'ember';

var SortBy = Ember.Object.extend().reopenClass({
    reorder: function(currentSort, column) {
        let sorted = [];
        let existing = -1;
        if(currentSort) {
            sorted = currentSort.split(',');
            existing = Ember.$.inArray(column, sorted);
            if(existing > -1) {
                sorted[existing] = '-' + column;
            }else if(!column.match(/[-]/)) {
                existing = Ember.$.inArray('-' + column, sorted);
                sorted[existing] = column;
            }
        }
        if(existing === -1) {
            sorted.push(column);
        }
        return sorted;
    }
});

export default SortBy;
