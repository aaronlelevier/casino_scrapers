import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-components/utils/equal';

export default Model.extend({
  key: attr(''),
  context: attr(''),
  field: attr(''),
  criteria_fks: [],
  criteria_ids: [],
  criteriaIsDirty: Ember.computed('criteria_fks.[]', 'criteria_ids.[]', function() {
    const { criteria_fks, criteria_ids } = this.getProperties('criteria_fks', 'criteria_ids');
    return equal(criteria_fks, criteria_ids) ? false : true;
    }),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'criteriaIsDirty', function() {
    return this.get('isDirty') || this.get('criteriaIsDirty');
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
      key: this.get('key'),
      context: this.get('context'),
      field: this.get('field'),
      criteria: this.get('criteria_fks')
    };
  }
});
