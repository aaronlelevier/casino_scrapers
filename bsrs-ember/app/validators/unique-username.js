import Ember from 'ember';
import storeInject from 'bsrs-ember/utilities/store';
import inject from 'bsrs-ember/utilities/inject';
import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
    store: storeInject('main'),
    repository: inject('person'),
    validate(value/*, options, model, attribute*/) {
        const repository = this.get('repository');
        if(Ember.isEmpty(value)){ return; }
        return repository.findUsername(value).then(response => {
            return response.count === 0 ? true : `Username ${value} already exists`;
        });
    }
});