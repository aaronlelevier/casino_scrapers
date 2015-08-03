import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var RoleNew = Ember.Component.extend(ValidationMixin, {
    repository: inject('role'),
    nameValidation: validate('model.name'),
    roleTypeValidation: validate('model.role_type'),
    locationLevelValidation: validate('model.location_level'),
    actions: {
        saveRole() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('saveRole');   
                });
            }
        },
        cancelRole() {
            this.sendAction('redirectUser');
        }
    }
});

export default RoleNew;
