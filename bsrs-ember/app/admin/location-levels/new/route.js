import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationLevelNew = TabRoute.extend({
    repository: injectRepo('location-level'),
    redirectRoute: Ember.computed(function() { return 'admin.location-levels.index'; }),
    modelName: Ember.computed(function() { return 'location-level'; }),
    templateModelField: Ember.computed(function() { return 'location-level'; }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        let location_level_options = this.get('store').find('location-level');
        let model = this.get('model_fetch');
        return {
            model: model,
            location_level_options: location_level_options
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('location_level_options', hash.location_level_options);
    }
});

export default LocationLevelNew;
