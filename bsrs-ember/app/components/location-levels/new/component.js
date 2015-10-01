import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import BaseComponent from 'bsrs-ember/components/base-component-new/component';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationLevelNew = BaseComponent.extend(ValidationMixin, {
    nameValidation: validate('model.name'),
    filtered_location_levels: Ember.computed('all_location_levels.[]', function() { //TODO: test model.@each is needed or not?
        var model = this.get('model');
        return this.get('all_location_levels').toArray().filter(function(level) {
            return model.get('id') !== level.get('id'); 
        }); 
    }),
    actions: {
        save() {
            this.set('submitted', true);
            if (this.get('valid')) {
                this._super();
            }
        },
        changed(model, val) {
            Ember.run(() => {
                var adding = this.get('store').find('location-level', val);
                adding.set('parent_id', this.get('model.id'));
            });
        }
    }
});

export default LocationLevelNew;
