import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

const Validations = buildValidations({
  type: [
    validator('presence', {
      presence: true,
      message: 'errors.automation.type'
    }),
    validator('automation-action-type')
  ]
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
  },
  simpleStore: Ember.inject.service(),
  sendemailIsDirtyContainer: Ember.computed('sendemailIsDirty', 'sendemail.isDirtyOrRelatedDirty', function() {
    return this.get('sendemailIsDirty') || this.get('sendemail.isDirtyOrRelatedDirty');
  }),
  sendsmsIsDirtyContainer: Ember.computed('sendsmsIsDirty', 'sendsms.isDirtyOrRelatedDirty', function() {
    return this.get('sendsmsIsDirty') || this.get('sendsms.isDirtyOrRelatedDirty');
  }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'typeIsDirty', 'priorityIsDirty', 'statusIsDirty', 'sendemailIsDirtyContainer', 'sendsmsIsDirtyContainer', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('typeIsDirty') || this.get('priorityIsDirty') || this.get('statusIsDirty') || this.get('sendemailIsDirtyContainer') || this.get('sendsmsIsDirtyContainer');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackType();
    this.rollbackAssignee();
    this.rollbackPriority();
    this.rollbackStatus();
    this.rollbackSendemail();
    this.rollbackSendsms();
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
  },
  serialize() {
    let content;
    switch (this.get('type.key')) {
      case 'automation.actions.ticket_assignee':
        content = {assignee: this.get('assignee.id')};
        break;
      case 'automation.actions.ticket_priority':
        content = {priority: this.get('priority.id')};
        break;
      case 'automation.actions.ticket_status':
        content = {status: this.get('status.id')};
        break;
      case 'automation.actions.send_email':
        content = {
          sendemail: {
            id: this.get('sendemail.id'),
            body: this.get('sendemail.body'),
            subject: this.get('sendemail.subject'),
            recipients: this.get('sendemail.recipient_ids'),
          }
        };
        break;
      case 'automation.actions.send_sms':
        content = {
          sendsms: {
            id: this.get('sendsms.id'),
            message: this.get('sendsms.message'),
            recipients: this.get('sendsms.recipient_ids'),
          }
        };
        break;
    }
    return {
      id: this.get('id'),
      type: this.get('type.id'),
      content: content
    };
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
