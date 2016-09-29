import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';
import SaveAndRollbackRelatedMixin from 'bsrs-ember/mixins/model/save-and-rollback-related';

const Validations = buildValidations({
  description: [
    validator('presence', {
      presence: true,
      message: 'errors.automation.description'
    }),
    validator('length', {
      min: 5,
      max: 500,
      message: 'errors.automation.description.min_max'
    })
  ],
  event: validator('length', {
    min: 1,
    message: 'errors.automation.event.length'
  }),
  pf: validator('has-many')
});

export default Model.extend(OptConf, Validations, SaveAndRollbackRelatedMixin, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('action', 'automation', {dirty: false});
    many_to_many.bind(this)('pf', 'automation', {dirty: false});
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),

    // TODO: remove unlasAddedM2M
  pfIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('automation_pf'),
  pfIsDirty: Ember.computed('pf.@each.{isDirtyOrRelatedDirty}', 'pfIsDirtyContainer', function() {
    const pf = this.get('pf');
    return pf.isAny('isDirtyOrRelatedDirty') || this.get('pfIsDirtyContainer');
  }),
  pfIsNotDirty: Ember.computed.not('pfIsDirty'),

  actionIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('automation_action'),
  actionIsDirty: Ember.computed('action.@each.{isDirtyOrRelatedDirty}', 'actionIsDirtyContainer', function() {
    const action = this.get('action');
    return action.isAny('isDirtyOrRelatedDirty') || this.get('actionIsDirtyContainer');
  }),
  actionIsNotDirty: Ember.computed.not('actionIsDirty'),

  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'pfIsDirty', 'eventIsDirty', 'actionIsDirty', function() {
    return this.get('isDirty') || this.get('pfIsDirty') || this.get('eventIsDirty') || this.get('actionIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollback() {
    this.rollbackEvent();
    this.rollbackRelatedContainer('action');
    this.rollbackAction();
    this.rollbackRelatedContainer('pf');
    this.rollbackPf();
    this._super(...arguments);
  },
  saveRelated() {
    this.saveEvent();
    this.saveRelatedContainer('action');
    this.saveAction();
    this.saveRelatedContainer('pf');
    this.savePf();
  },
  removeRecord() {
    run(() => {
      this.get('simpleStore').remove('automation', this.get('id'));
    });
  },
  serialize() {
    this.get('pf').forEach(f => {
      if (!f.get('source_id')) {
        this.remove_pf(f.get('id'));
      }
    });
    return {
      id: this.get('id'),
      description: this.get('description'),
      events: this.get('event_ids'),
      filters: this.get('pf').map((obj) => obj.serialize()),
      actions: this.get('action').map((obj) => obj.serialize())
    };
  },
});
