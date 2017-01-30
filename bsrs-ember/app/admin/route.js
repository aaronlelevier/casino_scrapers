import Ember from 'ember';

export default Ember.Route.extend({
  personCurrent: Ember.inject.service('person-current'),
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
        // for Client Error (404) - transition out of context
        this.intermediateTransitionTo('admin.error', error);
      } else {
        // transition out of context to 500 error
        this.intermediateTransitionTo('application_error', error);
      }
    }
  }
});
