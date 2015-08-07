import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

export default Ember.Component.extend(ValidationMixin, {
    repository: inject('location-level'),
    nameValidation: validate('model.name'),
    filtered_location_levels: Ember.computed('all_location_levels.@each', function() { //TODO: test model.@each is needed or not?
        var model = this.get('model');
        return this.get('all_location_levels').toArray().filter(function(level) {
            return model.get('id') !== level.get('id'); 
        }); 
    }),
    actions: {
        saveLocationLevel() {
            this.set('submitted', true);
            if (this.get('valid')) {
                var model = this.get('model');
                var repository = this.get('repository');
                repository.insert(model).then(() => {
                    this.sendAction('saveLocationLevel');
                });
            }
        },
        cancelLocationLevel() {
            this.sendAction('redirectUser');
        }
    }
});

