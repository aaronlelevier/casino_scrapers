import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationNewRoute = TabRoute.extend({
    repository: inject('location'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'Location'; }),
    model_fetch: Ember.computed(function() {
        return this.get('repository').create();
    }),
    model() {
        let all_location_levels = this.get('store').find('location-level');
        let model = this.get('model_fetch');
        return {
            model: model,
            all_location_levels: all_location_levels
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
    }
});

export default LocationNewRoute;
