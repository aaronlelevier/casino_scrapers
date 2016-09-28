import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  repository: injectRepo('automation'),
  uuid: injectUUID('uuid'),
  actions: {
    addAction() {
      const id = this.get('uuid').v4();
      this.get('model').add_action({id: id});
    },
    setActionType(automationAction, newActionType) {
      automationAction.change_type(newActionType);
    },
    fetchActions() {
      this.get('repository').getActionTypes().then((response) => {
        this.set('options', response.results);
      });
    }
  }
});