import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import { ACTION_SEND_EMAIL, ACTION_SEND_SMS, ACTION_ASSIGNEE, ACTION_PRIORITY, ACTION_STATUS, ACTION_TICKET_REQUEST, ACTION_TICKET_CC } from 'bsrs-ember/models/automation-action';

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
    /** 
     * @method setActionType
     * 1. sets type on automation-action model i.e. 'automation.action.send_email'
     * 2. if has existing type, need to remove old related (sendemail, sendsms, status, priority)
     * 3. set child model on action model i.e. 'sendsms' - need to pass id to actually create the action type child
     */
    setActionType(automationAction, newActionType) {

      // if existing type, can remove related models
      if (automationAction.get('type.id')) {
        automationAction.remove_related();
      }
      // set type
      automationAction.change_type(newActionType);

      // push in a blank child model
      const id = this.get('uuid').v4();
      switch (newActionType.key) { 
        case ACTION_ASSIGNEE:
          automationAction.change_assignee({id: id, fullname: ''});
          break;
        case ACTION_PRIORITY:
          automationAction.change_priority({id: id});
          break;
        case ACTION_STATUS:
          automationAction.change_status({id: id});
          break;
        case ACTION_SEND_EMAIL:
          automationAction.change_sendemail({id: id});
          break;
        case ACTION_SEND_SMS:
          automationAction.change_sendsms({id: id});
          break;
      }
    },
    fetchActions() {
      this.get('repository').getActionTypes().then((response) => {
        this.set('optionz', response.results);
      });
    },
    /** 
     * @method delete
     * - if action length > 1, remove action
     * - if action length === 1, remove type and remove all other related models, but keep action.  Cant delete action or else shows jenk on UI
     */
    delete(item) {
      let model = this.get('model');
      if (model.get('action.length') === 1) {
        model.get('action').objectAt(0).remove_related();
        model.get('action').objectAt(0).remove_type(item.get('type.id'));
      } else {
        model.remove_action(item.get('id'));
      }
    }
  }
});
