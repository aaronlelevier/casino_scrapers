import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

export default TabNewRoute.extend({
  repository: inject('<%= dasherizedModuleName %>'),
  redirectRoute: '<%= dasherizedModuleName %>s.index',
  module: '<%= dasherizedModuleName %>',
  templateModelField: '<%= CapFirstLetterModuleName %>',
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    const model = this.get('repository').create(new_pk);
    return Ember.RSVP.hash({
      model
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});
