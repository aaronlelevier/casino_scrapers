import Ember from 'ember';

var remove_and_shift = function(sorted, column, existing) {
    let removed = sorted.filter((_, index) => {
        return index !== existing;
    });
    removed.unshift(column);
    return removed;
};

var SortBy = Ember.Mixin.create({
    reorder: function(currentSort, column) {
        let sorted = [];
        let existing = -1;
        if(currentSort) {
            sorted = currentSort.split(',');
            existing = Ember.$.inArray(column, sorted);
            if(existing > -1) {
                sorted = remove_and_shift(sorted, '-' + column, existing);
            }else if(!column.match(/[-]/)) {
                existing = Ember.$.inArray('-' + column, sorted);
                if(existing > -1) {
                    sorted.splice(existing, 1);
                }
            }
        }
        if(existing === -1) {
            sorted.unshift(column);
        }
        return sorted;
    }
});

export default SortBy;
