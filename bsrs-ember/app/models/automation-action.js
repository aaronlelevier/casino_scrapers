import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';

const Validations = buildValidations({
  type: [
    validator('presence', {
      presence: true,
      message: 'errors.automation.type'
    }),
    validator('automation-action-type')
  ]
});

export default Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('type', 'automation-action');
    belongs_to.bind(this)('assignee', 'automation-action');
    belongs_to.bind(this)('priority', 'automation-action');
  },
  simpleStore: Ember.inject.service(),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'typeIsDirty', 'priorityIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('typeIsDirty') || this.get('priorityIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackType();
    this.rollbackAssignee();
    this.rollbackPriority();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveType();
    this.saveAssignee();
    this.savePriority();
  },
  serialize() {
    return {
      id: this.get('id'),
      type: this.get('type.id'),
      content: {
        assignee: this.get('assignee.id')
      }
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
