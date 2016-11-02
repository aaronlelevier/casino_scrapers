import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Component.extend({
  repository: injectRepo('automation'),
  uuid: injectUUID('uuid'),
  actions: {
    /* @method addAction
     * adds a dummy action to the automation model
     */
    addAction() {
      const id = this.get('uuid').v4();
      this.get('model').add_action({id: id});
    },
    /* @method setActionType
     * 1. sets type on automation-action model i.e. 'automation.action.send_email'
     * 2. set child model on action model i.e. 'sendsms'
     */
    setActionType(automationAction, newActionType) {
      automationAction.change_type(newActionType);
      const id = this.get('uuid').v4();
      switch (newActionType.key) {
        case 'automation.actions.ticket_assignee':
          automationAction.change_assignee({id: id});
          break;
        case 'automation.actions.ticket_priority':
          automationAction.change_priority({id: id});
          break;
        case 'automation.actions.ticket_status':
          automationAction.change_status({id: id});
          break;
        case 'automation.actions.send_email':
          automationAction.change_sendemail({id: id});
          break;
        case 'automation.actions.send_sms':
          automationAction.change_sendsms({id: id});
          break;
      }
    },
    fetchActions() {
      this.get('repository').getActionTypes().then((response) => {
        this.set('optionz', response.results);
      });
    },
    delete(item) {
      let model = this.get('model');
      if (model.get('action.length') === 1) {
        model.get('action').objectAt(0).remove_type(item.get('type.id'));
      } else {
        model.remove_action(item.get('id'));
      }
    }
  }
});
