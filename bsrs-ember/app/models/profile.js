import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConfMixin from 'bsrs-ember/mixins/optconfigure/profile';

export default Model.extend(OptConfMixin, {
  init() {
    belongs_to.bind(this)('assignee', 'profile', {bootstrapped: false});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackAssignee();
    this._super();
  },
  saveRelated() {
    this.saveAssignee();
  },
  serialize() {
    return {
      id: this.get('id'),
      description: this.get('description'),
      assignee: this.get('assignee').get('id'),
    };
  },
});
