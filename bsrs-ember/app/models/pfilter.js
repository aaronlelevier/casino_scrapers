import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many, many_to_many_dirty_unlessAddedM2M } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/pfilter';

const Validations = buildValidations({
  criteria: validator('length', {
    min: 1,
    message: 'errors.assignment.pf.criteria.length'
  }),
});

export default Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('criteria', 'pfilter');
  },
  simpleStore: Ember.inject.service(),
  // lookups: attr(''),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'criteriaIsDirty', function() {
    return this.get('isDirty') || this.get('criteriaIsDirty');
  }),
  saveRelated() {
    this.saveCriteria();
  },
  rollback() {
    this.rollbackCriteria();
  },
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  serialize() {
    return {
      id: this.get('id'),
      lookups: this.get('lookups'),
      criteria: this.get('criteria_ids')
    };
  }
});
