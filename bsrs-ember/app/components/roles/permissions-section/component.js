import Ember from 'ember';
import { RESOURCES_WITH_PERMISSION } from 'bsrs-ember/utilities/constants';

export default Ember.Component.extend({
  // DUPLICATED. GET FROM ROLE MODEL
  permissionsList: RESOURCES_WITH_PERMISSION,
});
