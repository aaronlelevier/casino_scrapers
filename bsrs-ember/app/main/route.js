import Ember from 'ember';

export default Ember.Route.extend({
  redirect(model, transition) {
    // Since the main route acts as the application/index (default) app route
    // rediret to the dashboard as the default route for `/`
    if (transition.handlerInfos.get('lastObject.name') === 'main.index') {
      this.transitionTo('dashboard');
    }
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
