import Ember from 'ember';
import RoleSingleComponent from 'bsrs-ember/components/roles/role-single/component';
import ChangeBoolMixin from 'bsrs-ember/mixins/components/change-bool';

var RoleSingle = RoleSingleComponent.extend(ChangeBoolMixin, {
  simpleStore: Ember.inject.service(),
  currencyObject: Ember.computed('model.auth_currency', function() {
    let store = this.get('simpleStore');
    return store.find('currency', this.get('model.auth_currency'));
  })
});

export
default RoleSingle;