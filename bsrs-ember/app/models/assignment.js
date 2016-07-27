import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/assignment';

const Validations = buildValidations({
  description: [
    validator('presence', {
      presence: true,
      message: 'errors.assignment.description'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.assignment.description.min_max'
    })
  ],
  assignee: [
    validator('presence', {
      presence: true,
      message: 'errors.assignment.assignee'
    }),
  ],
});

export default Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('assignee', 'assignment');
    many_to_many.bind(this)('pf', 'assignment');
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'pfIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('pfIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackAssignee();
    this.rollbackPf();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveAssignee();
    this.savePf();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('assignment', this.get('id'));
    });
  },
  serialize() {
    return {
      id: this.get('id'),
      description: this.get('description'),
      assignee: this.get('assignee').get('id'),
      filters: this.get('pf').map((obj) => { return obj.serialize(); })
    };
  },
});
