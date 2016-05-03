import Ember from 'ember';
import storeInject from 'bsrs-ember/utilities/store';
import inject from 'bsrs-ember/utilities/inject';
import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  store: storeInject('main'),
  repository: inject('person'),
  i18n: Ember.inject.service(),
  validate(value, options, model, attribute) {
    const repository = this.get('repository');
    if (Ember.isEmpty(value)) { return 'errors.person.username'; }//check to see if needed w/ two validators
    if (model.get('isNotDirtyOrRelatedNotDirty')) { return true; }
    return repository.findUsername(value).then(response => {
      return response.count === 0 ? true : 'admin.person.unique_username';
    });
  }
});
