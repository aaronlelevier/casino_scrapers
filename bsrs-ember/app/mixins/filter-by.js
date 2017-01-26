import Ember from 'ember';

var FilterBy = Ember.Mixin.create({
  /**
   * @method toggle
   * @param {Object} column
   */
  toggle(column) {
    const field = column && column.field;

    // on close, sets all of these to undefined
    this.set('filterField', field);

    // toggleFilter is variable to show dialog or not
    this.toggleProperty('toggleFilter');
    const headerLabel = column && column.headerLabel;
    this.set('filterPlaceholder', headerLabel);
    this.set('page', 1);
  }
});

export default FilterBy;
