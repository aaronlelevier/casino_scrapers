import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConfMixin from 'bsrs-ember/mixins/optconfigure/profile';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  description: [
    validator('presence', {
      presence: true,
      message: 'errors.profile.description'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.profile.description.min_max'
    })
  ],
});

export default Model.extend(OptConfMixin, Validations, {
  init() {
    belongs_to.bind(this)('assignee', 'profile');
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
    this._super(...arguments);
  },
  saveRelated() {
    this.saveAssignee();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('profile', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      description: this.get('description'),
      assignee: this.get('assignee').get('id'),
    };
  },
});
