import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationLevelComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('location-level'),
    classNames: ['wrapper', 'form'],
    nameValidation: validate('model.name'),
    actions: {
        saveLocationLevel() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.update(model).then(() => {
                    this.sendAction('saveLocationLevel');
                });
            }
        },
        cancelLocationLevel() {
            this.sendAction('redirectUser');
        },
        // deleteLocation() {            
        //     var model = this.get('model');
        //     var repository = this.get('repository');
        //     repository.delete(model.get('id'));
        //     this.sendAction('redirectUser');
        // }
    }
});

export default LocationLevelComponent;

