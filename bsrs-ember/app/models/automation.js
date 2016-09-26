import Ember from 'ember';
const { run } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/automation';

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

export default Model.extend(OptConf, Validations, {
  init() {
    many_to_many.bind(this)('event', 'automation');
    many_to_many.bind(this)('action', 'automation');
    many_to_many.bind(this)('pf', 'automation', {dirty: false});
    this._super(...arguments);
  },
  simpleStore: Ember.inject.service(),
  description: attr(''),
  pfIsDirtyContainer: many_to_many_dirty_unlessAddedM2M('automation_pf'),
  pfIsDirty: Ember.computed('pf.@each.{isDirtyOrRelatedDirty}', 'pfIsDirtyContainer', function() {
    const pf = this.get('pf');
    return pf.isAny('isDirtyOrRelatedDirty') || this.get('pfIsDirtyContainer');
  }),
  pfIsNotDirty: Ember.computed.not('pfIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'pfIsDirty', 'eventIsDirty', 'actionIsDirty', function() {
    return this.get('isDirty') || this.get('pfIsDirty') || this.get('eventIsDirty') || this.get('actionIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  rollbackPfContainer() {
    const pf = this.get('pf');
    pf.forEach((model) => {
      model.rollback();
    });
  },
  rollback() {
    this.rollbackEvent();
    this.rollbackAction();
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
    this.saveEvent();
    this.savePfContainer();
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
      filters: this.get('pf').map((obj) => obj.serialize())
    };
  },
});
