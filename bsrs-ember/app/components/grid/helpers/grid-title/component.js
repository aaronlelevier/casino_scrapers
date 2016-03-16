import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    resetGrid() {
      this.setProperties({page: 1, sort: undefined, find: undefined, search: undefined});
    }
  }
});
