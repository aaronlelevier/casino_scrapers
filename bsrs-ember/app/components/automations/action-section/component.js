import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import { ACTION_ASSIGNEE, ACTION_PRIORITY, ACTION_SEND_EMAIL, ACTION_SEND_SMS,
  ACTION_STATUS, ACTION_TICKET_REQUEST, ACTION_TICKET_CC } from 'bsrs-ember/models/automation-action';

export default Ember.Component.extend({
  repository: injectRepo('automation'),
  uuid: injectUUID('uuid'),
  filterActions(results) {
    const automation = this.get('model');
    const actions = automation.get('action');
    const automation_action_type_ids = actions.map(action => action.get('type.id'));
    return results.filter((item) => {
      const key = item.key;
      if (key === ACTION_PRIORITY || key === ACTION_STATUS || key === ACTION_ASSIGNEE || key === ACTION_TICKET_REQUEST || key === ACTION_TICKET_CC) {
        return automation_action_type_ids.includes(item.id) ? false : true;
      }
      return true;
    });
  },
  actions: {
    /**
     * @method addAction
     * adds a dummy action to the automation model to show specifically on automation new
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

      // if existing type, can remove related models so dont have multiple related models when only one type is selected (ie assignee and sendsms)
      if (automationAction.get('type.id')) {
        automationAction.remove_related();
      }
      // set type
      automationAction.change_type(newActionType);

      // push in a blank child model in order to have a model to add recipients to
      const id = this.get('uuid').v4();
      switch (newActionType.key) { 
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
        const results = this.filterActions(response.results);
        this.set('optionz', results);
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
