import Ember from 'ember';
const { run, get, set } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

export const ACTION_SEND_EMAIL = 'automation.actions.send_email';
export const ACTION_SEND_SMS = 'automation.actions.send_sms';
export const ACTION_ASSIGNEE = 'automation.actions.ticket_assignee';
export const ACTION_PRIORITY = 'automation.actions.ticket_priority';
export const ACTION_STATUS = 'automation.actions.ticket_status';
export const ACTION_TICKET_REQUEST = 'automation.actions.ticket_request';
export const ACTION_TICKET_CC = 'automation.actions.ticket_cc';

const Validations = buildValidations({
  request: validator('action-ticket-request'),
  type: validator('presence', {
    presence: true,
    body: 'errors.automation.type'
  }),
  sendemail: validator('belongs-to'),
  sendsms: validator('belongs-to'),
  ticketcc: validator('action-ticketcc', {
    dependentKeys: ['model.type']
  }),
  assignee: validator('action-assignee', {
    dependentKeys: ['model.type']
  }),
});

export default Model.extend(OptConf, Validations, SaveAndRollbackRelatedMixin, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('type', 'automation-action');
    // optional related models based upon the "type"
    belongs_to.bind(this)('assignee', 'automation-action');
    belongs_to.bind(this)('priority', 'automation-action');
    belongs_to.bind(this)('status', 'automation-action');
    belongs_to.bind(this)('sendemail', 'automation-action');
    belongs_to.bind(this)('sendsms', 'automation-action');
    many_to_many.bind(this)('ticketcc', 'automation-action');
    // documentation for m2m models fk array used for dirty tracking
    set(this, 'ticketcc_fks', get(this, 'ticketcc_fks') || []);
  },
  simpleStore: Ember.inject.service(),
  // request is only required for an action type of 'automation.actions.ticket_request', otherwise blank
  request: attr(''),
  sendemailIsDirtyContainer: Ember.computed('sendemailIsDirty', 'sendemail.isDirtyOrRelatedDirty', function() {
    return this.get('sendemailIsDirty') || this.get('sendemail.isDirtyOrRelatedDirty');
  }),
  sendsmsIsDirtyContainer: Ember.computed('sendsmsIsDirty', 'sendsms.isDirtyOrRelatedDirty', function() {
    return this.get('sendsmsIsDirty') || this.get('sendsms.isDirtyOrRelatedDirty');
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'ticketccIsDirty', 'typeIsDirty', 'priorityIsDirty', 'statusIsDirty', 'sendemailIsDirtyContainer', 'sendsmsIsDirtyContainer', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('ticketccIsDirty')|| this.get('typeIsDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('sendemailIsDirtyContainer') || this.get('sendsmsIsDirtyContainer');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackType();
    this.rollbackAssignee();
    this.rollbackPriority();
    this.rollbackStatus();
    this.rollbackSendemail();
    this.rollbackSendsms();
    this.rollbackTicketcc();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveType();
    this.saveAssignee();
    this.savePriority();
    this.saveStatus();
    this.saveRelatedBelongsTo('sendemail');
    this.saveSendemail();
    this.saveRelatedBelongsTo('sendsms');
    this.saveSendsms();
    this.saveTicketcc();
  },
  serialize() {
    let content;
    switch (this.get('type.key')) {
      case 'automation.actions.ticket_assignee':
        content = {assignee: this.get('assignee.id')};
        break;
      case 'automation.actions.ticket_cc':
        content = {ccs: this.get('ticketcc_ids')};
        break;
      case 'automation.actions.ticket_priority':
        content = {priority: this.get('priority.id')};
        break;
      case 'automation.actions.ticket_status':
        content = {status: this.get('status.id')};
        break;
      case 'automation.actions.send_email':
        let recipients = this.get('sendemail.recipient').map((person) => {
          return {id: get(person, 'id'), type: get(person, 'type')};
        });
        content = {
          body: this.get('sendemail.body'),
          subject: this.get('sendemail.subject'),
          recipients: recipients,
        };
        break;
      case 'automation.actions.send_sms':
        recipients = this.get('sendsms.recipient').map((person) => {
          return {id: get(person, 'id'), type: get(person, 'type')};
        });
        content = {
          body: this.get('sendsms.body'),
          recipients: recipients
        };
        break;
      case 'automation.actions.ticket_request':
        content = {request: this.get('request')};
        break;
    }
    return {
      id: this.get('id'),
      type: this.get('type.id'),
      content: content
    };
  },
  remove_related() {
    switch (this.get('type').get('key')) { 
      case ACTION_ASSIGNEE:
        this.change_assignee();
        set(this, 'assignee_fk', undefined);
        break;
      case ACTION_PRIORITY:
        this.change_priority();
        set(this, 'priority_fk', undefined);
        break;
      case ACTION_STATUS:
        this.change_status();
        set(this, 'status_fk', undefined);
        break;
      case ACTION_SEND_EMAIL:
        this.change_sendemail();
        set(this, 'sendemail_fk', undefined);
        break;
      case ACTION_SEND_SMS:
        this.change_sendsms();
        set(this, 'sendsms_fk', undefined);
        break;
      case ACTION_TICKET_CC:
        const ticketcc = this.get('ticketcc');
        if (ticketcc.get('length') > 0) {
          this.remove_ticketcc(ticketcc.objectAt(0).get('id'));
        }
        break;
    }
  },
  remove_type(id) {
    const store = this.get('simpleStore');
    let actionsArr = store.find('automation-action-type', id).get('actions');
    actionsArr.splice(actionsArr.indexOf(this.get('id')), 1);
    run(() => {
      store.push('automation-action-type', {id:this.get('id'), actions: actionsArr});
    });
  }
});
