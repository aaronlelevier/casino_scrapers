import Ember from 'ember';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationLevelNew = TabRoute.extend({
    repository: injectRepo('location-level'),
    redirectRoute: Ember.computed(function() { return 'admin.location-levels.index'; }),
    modelName: Ember.computed(function() { return 'location-level'; }),
    templateModelField: Ember.computed(function() { return 'location-level'; }),
    model(params) {
        let new_pk = parseInt(params.new_id, 10);
        let location_level_options = this.get('store').find('location-level');
        let model = this.get('store').find('location-level', {new_pk: new_pk}).objectAt(0);
        if(!model){
            model = this.get('repository').create(new_pk);
        }
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
