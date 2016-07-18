import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var ThirdPartyNewRoute = TabRoute.extend({
  repository: inject('third-party'),
  status_repo: inject('status'),
  redirectRoute: 'admin.third-parties.index',
  module: 'third-party',
  templateModelField: Ember.computed(function() { return 'ThirdParty'; }),
  model(params) {
    let new_pk = parseInt(params.new_id, 10);
    const status_repo = this.get('status_repo');
    let model = this.get('simpleStore').find('third-party', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = this.get('repository').create(new_pk);
    }
    return Ember.RSVP.hash({
      model: model,
      statuses: status_repo.find()
    });
  },
  setupController: function(controller, hash) {
    controller.set('model', hash.model);
    controller.set('statuses', hash.statuses);
  }
});

export default ThirdPartyNewRoute;
