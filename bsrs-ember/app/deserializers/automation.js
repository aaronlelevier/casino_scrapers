import Ember from 'ember';
const { run } = Ember;
import injectUUID from 'bsrs-ember/utilities/uuid';
import { belongs_to } from 'bsrs-components/repository/belongs-to';
import { many_to_many_extract, many_to_many } from 'bsrs-components/repository/many-to-many';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';

export default Ember.Object.extend(OptConf, {
  uuid: injectUUID('uuid'),
  init() {
    this._super(...arguments);
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
      return this._deserializeSingle(response);
    } else {
      return this._deserializeList(response);
    }
  },
  extractActionsBelongsTo(action, extracted_obj, nested_string) {
    const nested = action[nested_string];
    delete action[nested_string];
    extracted_obj[action.id] = nested;
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
    const filters = response.filters;
    const events = response.events;
    const actions = response.actions;
    delete response.filters;
    delete response.events;
    delete response.actions;
    response.detail = true;
    let automation;
    run(() => {
      automation = store.push('automation', response);
      const [,eventData,] = this.setup_event(events, automation);

      let actionTypes = {};
      let assignees = {};
      let ticketccs = {};
      let priorities = {};
      let statuses = {};
      let sendemails = {};
      let sendsmss = {};
      let recipient;
      let sendsms_recipient;
      actions.forEach((a) => {
        // type
        const type = a.type;
        this.extractActionsBelongsTo(a, actionTypes, 'type');
        // delete a.type;
        // actionTypes[a.id] = type;
        // a.type_fk = type.id;

        /* START ACTION TYPE PROCESSING */

        if (a.assignee) {
          this.extractActionsBelongsTo(a, assignees, 'assignee');
        }
        if (a.ccs) {
          const ticketcc = a.ccs;
          delete a.ccs;
          ticketccs[a.id] = ticketcc;
        }
        if (a.priority) {
          this.extractActionsBelongsTo(a, priorities, 'priority');
        }
        if(a.status) {
          this.extractActionsBelongsTo(a, statuses, 'status');
        }

        //sendemail - delete recipients, type, body, subject (re-assign) and gen up uuid for send_email model
        if (type.key === 'automation.actions.send_email') {
          recipient = a.recipients; // {type: 'role', id: '1xxx'}
          delete a.recipients;
          let { body, subject } = a;
          delete a.body;
          delete a.subject;
          const sendemail = { id: this.get('uuid').v4(), body: body, subject: subject };
          sendemails[a.id] = sendemail;
          a.sendemail_fk = sendemail.id;
        }

        // sendsms
        if (type.key === 'automation.actions.send_sms') {
          sendsms_recipient = a.recipients;
          delete a.recipients;
          let { body } = a;
          delete a.body;
          const sendsms = { id: this.get('uuid').v4(), body: body };
          sendsmss[a.id] = sendsms;
          a.sendsms_fk = sendsms.id;
        }
        /* END ACTION TYPE PROCESSING */

        // must set as "detail" b/c this is a detail payload
        a.detail = true;
      });

      // push in the actions (pojo's) in the store and those are returned
      const [,actionData,] = this.setup_action(actions, automation);
      actionData.forEach((ad) => {
        const action = store.find('automation-action', ad.id);
        // type
        let type = actionTypes[ad.id];
        this.setup_type(type, action);

        // assignee
        let assignee = assignees[ad.id];
        this.setup_assignee(assignee, action);
        // ticketcc
        // action may have different ccs, so need to wipe out join models and make new ones based on server payload
        action.get('automation_action_ticketcc').forEach((m2m) => {
          store.push('action-join-person', {id: m2m.get('id'), removed: true});
        });
        let ticketcc = ticketccs[ad.id];
        if (ticketcc) {
          this.setup_ticketcc(ticketcc, action);
        }
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
        let sendsms = sendsmss[ad.id];
        this.setup_sendsms(sendsms, action);
        // setup recipients - req'd by detail payload
        if(sendsms) {
          const sendsms_hydrated = store.find('sendsms', sendsms.id);
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
      });
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
      run(() => {
        store.push('automation-list', model);
      });
    });
  }
});
