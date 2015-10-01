import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var LocationLevelNew = TabRoute.extend({
    uuid: inject('uuid'),
    repository: injectRepo('location-level'),
    redirectRoute: Ember.computed(function() { return 'admin.location-levels.index'; }),
    modelName: Ember.computed(function() { return 'location-level'; }),
    templateModelField: Ember.computed(function() { return 'location-level'; }),
    model() {
        let pk = this.get('uuid').v4();
        let repository = this.get('repository');
        let all_location_levels = this.get('store').find('location-level');
        let model = this.get('store').push('location-level', {id: pk});
        return Ember.RSVP.hash({
            model: model,
            all_location_levels: all_location_levels,
            repository: repository
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('repository', hash.repository);
    }
});

export default LocationLevelNew;
