import Ember from 'ember';
const { run } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';
import { ACTION_SEND_EMAIL, ACTION_SEND_SMS } from 'bsrs-ember/models/automation-action';

export default Ember.Object.extend(OptConf, {
  uuid: injectUUID('uuid'),
  init() {
    // relationship bindings give us a method called setup_.....
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('action', 'automation');
    many_to_many.bind(this)('pf', 'automation');
    belongs_to.bind(this)('type');
    belongs_to.bind(this)('assignee');
    belongs_to.bind(this)('priority');
    belongs_to.bind(this)('status');
    belongs_to.bind(this)('sendemail');
    belongs_to.bind(this)('sendsms');
    many_to_many.bind(this)('criteria', 'pfilter');
    many_to_many.bind(this)('ticketcc', 'automation-action');
  },
  deserialize(response, id) {
    if (id) {
      response.detail = true;
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  extractActionBelongsTo(action, nested_string) {
    const nested = action[nested_string];
    action[`${nested_string}_fk`] = nested.id;
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

    // delete keys
    const filters = response.filters;
    const events = response.events;
    const actions = response.actions;
    delete response.filters;
    delete response.events;
    delete response.actions;

    let automation = store.push('automation', response);
    const [,eventData,] = this.setup_event(events, automation);

    // remove type and action related keys before pushing into store
    // loop through actions, remove type / assignee and setup assignee with the hydrated action
    actions.forEach((a) => {

      let action = store.push('automation-action', { id: a.id, detail: true });

      // type
      const type = a.type;
      this.extractActionBelongsTo(a, 'type');
      this.setup_type(a.type, action);
      delete a['type'];

      /* START ACTION TYPE PROCESSING */

      if (a.assignee) {
        this.extractActionBelongsTo(a, 'assignee');
        this.setup_assignee(a.assignee, action);
        delete a['assignee'];
      }

      if (a.ccs) {
        // action may have different ccs, so need to wipe out join models and make new ones based on server payload
        action.get('automation_action_ticketcc').forEach((m2m) => {
          store.push('action-join-person', {id: m2m.get('id'), removed: true});
        });
        this.setup_ticketcc(a.ccs, action);
        delete a['ccs'];

      }

      if (a.priority) {
        this.extractActionBelongsTo(a, 'priority');
        this.setup_priority(a.priority, action);
        delete a['priority'];
      }

      if (a.status) {
        this.extractActionBelongsTo(a, 'status');
        this.setup_status(a.status, action);
        delete a['status'];
      }

      //sendemail - delete recipients, type, body, subject (re-assign) and gen up uuid for send_email model
      if (type.key === ACTION_SEND_EMAIL) {
        const recipient = a.recipients; // {type: 'role', id: '1xxx'}
        delete a.recipients;
        let { body, subject } = a;
        delete a.body;
        delete a.subject;
        const sendemail = { id: this.get('uuid').v4(), body: body, subject: subject };
        // sendemails[a.id] = sendemail;
        a.sendemail_fk = sendemail.id;

        // let sendemail = sendemails[ad.id];
        const sendemail_hydrated = this.setup_sendemail(sendemail, action);
        // setup recipients - req'd by detail payload
        let [m2m_recipients, recipients, server_sum] = many_to_many_extract(recipient, store, sendemail_hydrated, 'generic_recipient', 'generic_pk', 'related-person', 'recipient_pk');
        recipients.forEach((rec) => {
          store.push('related-person', rec);
        });
        m2m_recipients.forEach((m2m) => {
          store.push('generic-join-recipients', m2m);
        });
        store.push('sendemail', {id: sendemail_hydrated.get('id'), generic_recipient_fks: server_sum});
        // this.setup_recipient(recipient, sendemail_hydrated);
      }

      // sendsms
      if (type.key === ACTION_SEND_SMS) {
        const sendsms_recipient = a.recipients;
        delete a.recipients;
        let { body } = a;
        delete a.body;
        const sendsms = { id: this.get('uuid').v4(), body: body };
        a.sendsms_fk = sendsms.id;

        // sendsms
        const sendsms_hydrated = this.setup_sendsms(sendsms, action);
        // setup recipients - req'd by detail payload
        let [m2m_recipients, recipients, server_sum] = many_to_many_extract(sendsms_recipient, store, sendsms_hydrated, 'generic_recipient', 'generic_pk', 'related-person', 'recipient_pk');
        recipients.forEach((rec) => {
          store.push('related-person', rec);
        });
        m2m_recipients.forEach((m2m) => {
          store.push('generic-join-recipients', m2m);
        });
        store.push('sendsms', {id: sendsms_hydrated.get('id'), generic_recipient_fks: server_sum});
        // this.setup_recipient(sendsms_recipient, sendsms_hydrated);
      }

      /* END ACTION TYPE PROCESSING */
      // push in action with fks
      action = store.push('automation-action', a);
      action.save();

    });

    // push in the actions (pojo's) in the store and those are returned
    this.setup_action(actions, automation);

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
    const results = [];
    response.results.forEach((model) => {
      const automationList = this.get('functionalStore').push('automation-list', model);
      results.push(automationList);
    });
    return results;
  }
});
