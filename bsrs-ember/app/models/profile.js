import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConfMixin from 'bsrs-ember/mixins/optconfigure/profile';

const orderDefault = 0;

export default Model.extend(OptConfMixin, {
  init() {
    belongs_to.bind(this)('assignee', 'profile', {
      change_func: false
    });
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  assignee_id: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  change_assignee(obj) {
    let store = this.get('simpleStore');
    let modelId = this.get('id');
    store.push('person', {
      id: this.get('assignee_fk'),
      profiles: []
    });
    store.push('profile', {id: modelId, assignee_fk: obj.id});
    store.push('person', {
      id: obj.id,
      username: obj.username,
      profiles: [modelId]
    });
  },
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
      assignee: this.get('assignee_fk'),
    };
  },
});