import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
  repository: inject('ticket'),
  dashboardRepo: inject('dashboard'),
  dashboardData: Ember.computed(function() {
    let repo = this.get('dashboardRepo');
    return repo.detail();
  }),
  model() {
    return {
      model: this.get('repository').findTicketDrafts(),
      dashboardData: this.get('dashboardData')
    };
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('dashboardData', hash.dashboardData);
  },
});
