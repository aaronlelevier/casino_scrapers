import Ember from 'ember';
import Base from 'bsrs-ember/components/mobile/base';

export default Base.extend({
  changingPassword: false,
  actions: {
    changePassword() {
      this.toggleProperty('changingPassword');
      this.get('model').clearPassword();
    },
  }
});
