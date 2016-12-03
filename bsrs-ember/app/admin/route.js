import Ember from 'ember';

export default Ember.Route.extend({
  personCurrent: Ember.inject.service(),
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.admin.index');
  },
  model() {
    let personCurrent = this.get('personCurrent');
    return {
      settings_id: personCurrent.get('model').get('tenant')
    };
  },
  actions: {
    error(error) {
      if ([401,403].includes(error.code)) {
        this.send('showLogin');
      } else if (error.code >= 400 && error.code < 500) {
        this.intermediateTransitionTo('error', error);
      } else {
        this.intermediateTransitionTo('application_error', error);
      }
    }
  }
});
