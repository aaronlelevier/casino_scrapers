import Ember from 'ember';

export default Ember.Service.extend({
  simpleStore: Ember.inject.service(),
  requested: function(name, page) {
    let store = this.get('simpleStore');
    let pagination = store.push('pagination', {id: name}).get('pages');
    pagination.pushObject(page);
    return pagination;
  }
});
