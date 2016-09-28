import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation-action';

export default Model.extend(OptConf, {
  init() {
    belongs_to.bind(this)('type', 'automation-action');
    belongs_to.bind(this)('assignee', 'automation-action');
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'typeIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('typeIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackAssignee();
    this.rollbackType();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveAssignee();
    this.saveType();
  },
  serialize() {
    return {
      id: this.get('id'),
      type: this.get('type.id'),
      content: {
        assignee: this.get('assignee.id')
    }
    };
  }
});
