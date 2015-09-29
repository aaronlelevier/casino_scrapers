import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import TabRoute from 'bsrs-ember/admin/tab/new-route';

var LocationNewRoute = TabRoute.extend({
    uuid: inject('uuid'),
    redirectRoute: Ember.computed(function() { return 'admin.locations.index'; }),
    modelName: Ember.computed(function() { return 'location'; }),
    templateModelField: Ember.computed(function() { return 'Location'; }),
    model() {
        var pk = this.get('uuid').v4();
        var all_location_levels = this.get('store').find('location-level');
        var model = this.get('store').push('location', {id: pk, new: true});
        return Ember.RSVP.hash({
            model: model,
            all_location_levels: all_location_levels
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.locations');
        }
    }
});

export default LocationNewRoute;
