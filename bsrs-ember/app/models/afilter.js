import Ember from 'ember';
import { attr, Model } from 'ember-cli-simple-store/model';
import equal from 'bsrs-components/utils/equal';

export default Model.extend({
  key: attr(''),
  key_is_i18n: attr(),
  context: attr(''),
  field: attr(''),
  lookups: attr(),
  isDirtyOrRelatedDirty: Ember.computed('isDirty', 'criteriaIsDirty', function() {
    return this.get('isDirty');
  }),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
});
