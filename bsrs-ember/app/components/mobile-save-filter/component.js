import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['mobile-save-filterset t-mobile-save-filterset-component'],
  actions: {
    closeFiltersetInput() {
      this.toggleProperty('showSaveFilterInput');
    },
  }
});
