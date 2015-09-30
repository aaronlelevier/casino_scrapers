import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/admin/tab/route';

var LocationLevelSingle = TabRoute.extend({
    repository: inject('location-level'),
    redirectRoute: Ember.computed(function() { return 'admin.location-levels.index'; }),
    modelName: Ember.computed(function() { return 'location-level'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params) {
        var location_level_pk = params.location_level_id;
        var repository = this.get('repository');
        let location_level = this.get('store').find('location-level', location_level_pk);
        if (!location_level.get('length') || location_level.get('isNotDirtyOrRelatedNotDirty')) { 
            location_level = repository.findById(location_level_pk);
        }
        return location_level;
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelSingle;

