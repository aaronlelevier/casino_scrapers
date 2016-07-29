import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-components/utils/equal';
import { belongs_to } from 'bsrs-components/attr/belongs-to';
import OptConf from 'bsrs-ember/mixins/optconfigure/pfilter';

export default Model.extend(OptConf, {
  init() {
    this._super(...arguments);
    belongs_to.bind(this)('afilter', 'pfilter');
  },
  simpleStore: Ember.inject.service(),
  lookups: attr(''),
  criteria_fks: [],
  criteria_ids: [],
  criteriaIsDirty: Ember.computed('criteria_fks.[]', 'criteria_ids.[]', function() {
    const { criteria_fks, criteria_ids } = this.getProperties('criteria_fks', 'criteria_ids');
    return equal(criteria_fks, criteria_ids) ? false : true;
    }),
  criteriaIsNotDirty: Ember.computed.not('criteriaIsDirty'),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'criteriaIsDirty', 'afilterIsDirty', function() {
    return this.get('isDirty') || this.get('criteriaIsDirty') || this.get('afilterIsDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  add_criteria(id) {
    this.set('criteria_fks', this.get('criteria_fks').concat(id).uniq());
  },
  remove_criteria(id) {
    let { criteria_fks } = this.getProperties('criteria_fks');
    let index = criteria_fks.indexOf(id);
    if (index > -1) {
      criteria_fks.splice(index, 1);
      this.set('criteria_fks', criteria_fks);
    }
  },
  serialize() {
    return {
      id: this.get('id'),
      lookups: this.get('lookups'),
      criteria: this.get('criteria_fks')
    };
  }
});
