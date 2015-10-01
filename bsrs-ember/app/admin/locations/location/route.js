import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var LocationRoute = TabRoute.extend({
    repository: inject('location'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        let location_pk = params.location_id;
        let all_location_levels = this.get('store').find('location-level');
        let all_statuses = this.get('store').find('location-status');
        let repository = this.get('repository');
        let location = this.get('store').find('location', location_pk);
        if (!location.get('length') || location.get('isNotDirtyOrRelatedNotDirty')) { 
            location = repository.findById(location_pk);

        }
        return Ember.RSVP.hash({
            model: location,
            all_location_levels: all_location_levels,
            all_statuses: all_statuses,
            repository: repository
        });

    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('all_statuses', hash.all_statuses);
        controller.set('repository', hash.repository);
    }
});

export default LocationRoute;
