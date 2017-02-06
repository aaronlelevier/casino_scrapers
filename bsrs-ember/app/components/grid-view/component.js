import Ember from 'ember';

var GridViewComponent = Ember.Component.extend({
  classNames: ['wrapper'],

  /**
   * @property customHeaderBlock
   * @default false
   */
  customHeaderBlock: false,

  /**
   * @property toggleFilter
   * @default false
   */
  toggleFilter: false,

  /**
   * @property filterPlaceholder
   * @default null
   */

  filterPlaceholder: null,
  /**
   * @property filterColumn
   * @default null
   */
  filterColumn: null,
});

export default GridViewComponent;
