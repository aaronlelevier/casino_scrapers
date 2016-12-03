import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  i18n: Ember.inject.service(),
  title() {
    return this.get('i18n').t('doctitle.dashboard.index');
  },
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
