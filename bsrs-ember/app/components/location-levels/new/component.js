import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationLevelNew = Ember.Component.extend(ValidationMixin, {
    store: injectStore('main'),
    repository: inject('location-level'),
    nameValidation: validate('model.name'),
    filtered_location_levels: Ember.computed('all_location_levels.[]', function() { //TODO: test model.@each is needed or not?
        var model = this.get('model');
        return this.get('all_location_levels').toArray().filter(function(level) {
            return model.get('id') !== level.get('id'); 
        }); 
    }),
    actions: {
        changed(model, val) {
            Ember.run(() => {
                var adding = this.get('store').find('location-level', val);
                adding.set('parent_id', this.get('model.id'));
                //how does the above work with dirty tracking?
            });
        },
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

export default LocationLevelNew;
