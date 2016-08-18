import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_dirty, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
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
  pf: [
    validator('length', {
      min: 1,
      message: 'errors.assignment.pf.length'
    }),
    validator('has-many')
  ]
});

export default Model.extend(OptConf, Validations, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('assignee', 'assignment');
    //TODO: pf is available filters...or just filter...
    many_to_many.bind(this)('pf', 'assignment', {dirty: false});
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  pfIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('assignment_pf'),
  pfIsDirty: Ember.computed('pf.@each.{isDirtyOrRelatedDirty}', 'pfIsDirtyContainer', function() {
    const pf = this.get('pf');
    return pf.isAny('isDirtyOrRelatedDirty') || this.get('pfIsDirtyContainer');
  }),
  pfIsNotDirty: Ember.computed.not('pfIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'assigneeIsDirty', 'pfIsDirty', function() {
    return this.get('isDirty') || this.get('assigneeIsDirty') || this.get('pfIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollbackPfContainer() {
    const pf = this.get('pf');
    pf.forEach((model) => {
      model.rollback();
    });
  },
  rollback() {
    this.rollbackAssignee();
    this.rollbackPfContainer();
    this.rollbackPf();
    this._super(...arguments);
  },
  savePfContainer() {
    const pf = this.get('pf');
    pf.forEach((model) => {
      model.saveRelated();
      model.save();
    });
  },
  saveRelated() {
    this.saveAssignee();
    this.savePfContainer();
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
