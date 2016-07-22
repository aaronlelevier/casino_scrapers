import Ember from 'ember';

export default Ember.Component.extend({
  changingPassword: false,
  classNames: ['mobile-inner'],
  actions: {
    changePassword() {
      this.toggleProperty('changingPassword');
      this.get('model').clearPassword();
    },
  }
});
