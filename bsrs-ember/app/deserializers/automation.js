import Ember from 'ember';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';

export default Ember.Object.extend(OptConf, {
  init() {
    this._super(...arguments);
    // relationship bindings give us a method called setup_.....
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('action', 'automation');
    belongs_to.bind(this)('type');
    belongs_to.bind(this)('assignee');
    belongs_to.bind(this)('priority');
    belongs_to.bind(this)('status');
    belongs_to.bind(this)('sendemail');
    many_to_many.bind(this)('recipient', 'sendemail');
    belongs_to.bind(this)('sendsms');
    many_to_many.bind(this)('pf', 'automation');
    many_to_many.bind(this)('criteria', 'pfilter');
  },
  deserialize(response, id) {
    if (id) {
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  _deserializeSingle(response) {
    const store = this.get('simpleStore');
    // extract criteria
    let criteriaMap = {};
    for (let i in response.filters) {
      const f = response.filters[i];
      criteriaMap[f.id] = f.criteria;
      delete response.filters[i].criteria;
    }
    const filters = response.filters;
    const events = response.events;
    const actions = response.actions;
    delete response.filters;
    delete response.events;
    delete response.actions;
    response.detail = true;
    let automation = store.push('automation', response);
    const [,eventData,] = this.setup_event(events, automation);

    let actionTypes = {};
    let assignees = {};
    let priorities = {};
    let statuses = {};
    let sendemails = {};
    let sendsmss = {};
    let recipient;
    actions.forEach((a) => {
      // type
      const type = a.type;
      delete a.type;
      actionTypes[a.id] = type;
      a.type_fk = type.id;
      // assignee
      if (a.assignee) {
        const assignee = a.assignee;
        delete a.assignee;
        assignees[a.id] = assignee;
        a.assignee_fk = assignee.id;
      }
      // priority
      if (a.priority) {
        const priority = a.priority;
        delete a.priority;
        priorities[a.id] = priority;
        a.priority_fk = priority.id;
      }
      //status
      if(a.status) {
        const status = a.status;
        delete a.status;
        statuses[a.id] = status;
        a.status_fk = status.id;
      }
      //sendemail
      if(a.sendemail){
        recipient = a.sendemail.recipient;
        delete a.sendemail.recipient;
        const sendemail = a.sendemail;
        delete a.sendemail;
        sendemails[a.id] = sendemail;
        a.sendemail_fk = sendemail.id;
      }
      // sendsms
      if(a.sendsms){
        const sendsms = a.sendsms;
        delete a.sendsms;
        sendsmss[a.id] = sendsms;
        a.sendsms_fk = sendsms.id;
      }
      // must set as "detail" b/c this is a detail payload
      a.detail = true;
    });
    // push in the actions in the store and those are returned
    // actions == pojo's
    const [,actionData,] = this.setup_action(actions, automation);
    // actionData - pojo
    actionData.forEach((ad) => {
      const action = store.find('automation-action', ad.id);
      // type
      let type = actionTypes[ad.id];
      this.setup_type(type, action);
      // assignee
      let assignee = assignees[ad.id];
      this.setup_assignee(assignee, action);
      // priority
      let priority = priorities[ad.id];
      this.setup_priority(priority, action);
      // status - adds the action id to the array of 'actions' in the status model
      let status = statuses[ad.id];
      this.setup_status(status, action);
      //sendemail
      let sendemail = sendemails[ad.id];
      this.setup_sendemail(sendemail, action);
      // setup recipients - req'd by detail payload
      if (sendemail) {
        const sendemail_hydrated = store.find('sendemail', sendemail.id);
        this.setup_recipient(recipient, sendemail_hydrated);
      }
      // sendsms
      let sendsms = sendsmss[ad.id];
      this.setup_sendsms(sendsms, action);
    });

    const [,pfs,] = this.setup_pf(filters, automation);
    pfs.forEach((pf) => {
      const criteria = criteriaMap[pf.id];
      pf = store.push('pfilter', pf);
      this.setup_criteria(criteria, pf);
    });
    automation.save();
    return automation;
  },
  _deserializeList(response) {
    const store = this.get('simpleStore');
    response.results.forEach((model) => {
      store.push('automation-list', model);
    });
  }
});
