import Ember from 'ember';

/*
 * Only used in DTD
 */
export default Ember.Component.extend({
  classNames: ['search-wrap pull-left'],
  ariaRole: 'search',
  actions: {
    keyup(search) {
      Ember.run.scheduleOnce('actions', this, function() {
        this.set('page', 1);
        this.set('search', search);
      }.bind(this));
    },
  }
});
