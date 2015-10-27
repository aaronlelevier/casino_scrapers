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
        let location_level_options = this.get('store').find('location-level');
        let model = this.get('store').push('location-level', {id: pk});
        return Ember.RSVP.hash({
            model: model,
            location_level_options: location_level_options,
            new: true,
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('location_level_options', hash.location_level_options);
        controller.set('new', hash.new);
    }
});

export default LocationLevelNew;
