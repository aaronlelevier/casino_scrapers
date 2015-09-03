import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationLevelComponent = Ember.Component.extend(ValidationMixin, {
    repository: inject('location-level'),
    classNames: ['wrapper', 'form'],
    nameValidation: validate('model.name'),
    available_location_levels: Ember.computed(function() {
        let repository = this.get('repository');
        let location_level_id = this.get('model.id');
        let filter = function(location_level) {
            return location_level.get('id') !== location_level_id;
        };
        return repository.peek(filter, ['id']);
    }),
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
        deleteLocationLevel() {
            var model = this.get('model');
            var repository = this.get('repository');
            repository.delete(model.get('id'));
            this.sendAction('redirectUser');
        }
    }
});

export default LocationLevelComponent;

