import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationNewRoute = TabRoute.extend({
    uuid: inject('uuid'),
    repository: injectRepo('location'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'Location'; }),
    model() {
        let pk = this.get('uuid').v4();
        let repository = this.get('repository');
        let all_location_levels = this.get('store').find('location-level');
        let model = this.get('store').push('location', {id: pk, new: true});
        return Ember.RSVP.hash({
            model: model,
            all_location_levels: all_location_levels
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
    }
});

export default LocationNewRoute;
