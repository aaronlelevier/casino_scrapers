import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['flex-item--none mobile-save-filterset t-mobile-save-filterset-component'],
  didInsertElement() {
    this.$('input').focus();
  },
  actions: {
    closeFiltersetInput() {
      this.toggleProperty('showSaveFilterInput');
    },
  }
});
