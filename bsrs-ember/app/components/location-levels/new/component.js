import Ember from 'ember';
import TabMixin from 'bsrs-ember/mixins/components/tab/base';
import {ValidationMixin, validate} from 'ember-cli-simple-validation/mixins/validate';

var LocationLevelNew = Ember.Component.extend({
    //TODO: test model.@each is needed or not?
    filtered_location_levels: Ember.computed('all_location_levels.[]', function() {
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
    }
});

export default LocationLevelNew;
