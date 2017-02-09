import Ember from 'ember';

var GridViewComponent = Ember.Component.extend({
  classNames: ['wrapper'],

  /**
   * @property customHeaderBlock
   * @type Boolean
   * @default false
   */
  customHeaderBlock: false,

  /**
   * @property toggleFilter
   * @type Boolean
   * @default false
   */
  toggleFilter: false,

  /**
   * @property filterPlaceholder
   * @type String
   * @default null
   */

  filterPlaceholder: null,
  /**
   * @property filterColumn
   * @type Object - the specific object being filtered
   * @default null
   */
  filterColumn: null,
});

export default GridViewComponent;
