import Ember from 'ember';
import RoleSingleComponent from 'bsrs-ember/components/roles/role-single/component';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var RoleSingle = RoleSingleComponent.extend(ChangeBoolMixin, {
  simpleStore: Ember.inject.service(),
});

export default RoleSingle;