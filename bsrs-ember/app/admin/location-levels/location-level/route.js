import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var LocationLevelRoute = TabRoute.extend({
    repository: inject('location-level'),
    redirectRoute: Ember.computed(function() { return 'admin.location-levels.index'; }),
    modelName: Ember.computed(function() { return 'location-level'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        const location_level_pk = params.location_level_id;
        const repository = this.get('repository');
        let location_level = this.get('store').find('location-level', location_level_pk);
        return new Ember.RSVP.Promise((resolve) => {
            // if (!location_level.get('length') || location_level.get('isNotDirtyOrRelatedNotDirty')) { 
            repository.findById(location_level_pk).then((model) => {
                location_level = model;
                resolve({model:location_level});
            });
            // }
        });
    }, 
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    }
});

export default LocationLevelRoute;

