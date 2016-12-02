import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  dashboardRepo: inject('dashboard'),
  model() {
    let repo = this.get('dashboardRepo');
    return Ember.RSVP.hash({
      dashboardData: repo.detail()
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});
