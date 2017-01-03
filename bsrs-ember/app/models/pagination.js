import Ember from 'ember';

/**
 * @class Pagination
 */
export default Ember.Object.extend({
  init: function() {
    this.set('requested', []);
  },
  /**
   * - source is 'requested' as defined in the init
   * @property pages
   * @type Ember.Object
   * @return array
   */
  pages: Ember.computed(function() {
    return this.get('requested');
  })
});
