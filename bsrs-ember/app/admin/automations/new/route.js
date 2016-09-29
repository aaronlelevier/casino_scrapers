import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';
import injectUUID from 'bsrs-ember/utilities/uuid';

var automationNewRoute = TabNewRoute.extend({
  repository: inject('automation'),
  uuid: injectUUID('uuid'),
  redirectRoute: 'admin.automations.index',
  module: 'automation',
  templateModelField: 'automation',
  model(params) {
    const new_pk = parseInt(params.new_id, 10);
    const repository = this.get('repository');
    let model = this.get('simpleStore').find('automation', {new_pk: new_pk}).objectAt(0);
    if(!model){
      model = repository.create(new_pk);
      const id = this.get('uuid').v4();
      model.add_action({id: id});
    }
    return Ember.RSVP.hash({
      model,
      repository
    });
  },
  setupController: function(controller, hash) {
    controller.setProperties(hash);
  }
});

export default automationNewRoute;
