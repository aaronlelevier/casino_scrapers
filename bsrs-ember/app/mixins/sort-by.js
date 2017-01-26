import Ember from 'ember';

var remove_and_shift = function(sorted, column, existing) {
  let removed = sorted.filter((_, index) => {
    return index !== existing;
  });
  removed.unshift(column);
  return removed;
};

/* @mixin SortBy
* @param {array} currentSort - '['location.name', 'priority.name']'
* @param {string} column - 'location.name'
* method removes existing sorts and adds column
*/
var SortBy = Ember.Mixin.create({
  reorder: function(currentSort, column) {
    let sorted = [];
    let existing = -1;
    if(currentSort) {
      sorted = currentSort.split(',');
      existing = Ember.$.inArray(column, sorted);
      if(existing > -1) {
        /* if already in array of currentSort remove it and add column to start of array */
        sorted = remove_and_shift(sorted, '-' + column, existing);
      }else if(!column.match(/[-]/)) {
        /* if desc sort, remove it */
        existing = Ember.$.inArray('-' + column, sorted);
        if(existing > -1) {
          sorted.splice(existing, 1);
        }
      }
    }
    /* if no currentSort or not in currentSort unshift put added sort column on start of array */
    if(existing === -1) {
      sorted.unshift(column);
    }
    return sorted;
  }
});

export default SortBy;
