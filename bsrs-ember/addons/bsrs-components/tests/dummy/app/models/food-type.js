import Ember from 'ember';
import { many_to_many } from 'bsrs-components/attr/many-to-many';
import OPT_CONF from 'dummy/mixins/food_type_config';

export default Ember.Object.extend(OPT_CONF, {
  init() {
    this._super(...arguments);
    many_to_many.bind(this)('finger_food', 'food-type');
  },
  isDirtyOrRelatedDirty: Ember.computed.or('fingerFoodIsDirty'),
  isNotDirtyOrRelatedNotDirty: Ember.computed.not('isDirtyOrRelatedDirty'),
  simpleStore: Ember.inject.service(),
});
