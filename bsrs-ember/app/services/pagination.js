import Ember from 'ember';

/**
 * pagination store holds records for each view whose id is the resource ('ticket')
 * @class PaginationService
 */
export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  /**
   * @method requested
   * @param {String} name 
   * @param {String} page 
   * @return {Array} returns an array of pages
   */
  requested: function(name, page) {
    let store = this.get('simpleStore');
    let pagination = store.push('pagination', {id: name}).get('pages');
    pagination.pushObject(page);
    return pagination;
  }
});
