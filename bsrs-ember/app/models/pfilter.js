import Ember from 'ember';
const { get } = Ember;
import { attr, Model } from 'ember-cli-simple-store/model';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import { validator, buildValidations } from 'ember-cp-validations';
import OptConf from 'bsrs-ember/mixins/optconfigure/pfilter';


const Validations = buildValidations({
  criteria: validator((value, options, model, attribute) => {
    if (model.get('field') === 'auto_assign' || !model.get('source_id')) {
      return true;
    }
    return get(value, 'length') > 0 ? true : 'errors.automation.pf.criteria.length';
  })
});

export default Model.extend(Validations, OptConf, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('criteria', 'pfilter');
  },
  source_id: attr(''),
  simpleStore: Ember.inject.service(),
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
      source: this.get('source_id'),
      lookups: this.get('lookups'),
      criteria: this.get('criteria_ids')
    };
  }
});
