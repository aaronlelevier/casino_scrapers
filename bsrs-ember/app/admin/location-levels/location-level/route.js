import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelSingle =  Ember.Route.extend({
    repository: inject('location-level'),
    model(params) {
        var location_level_pk = params.location_level_id;
        var repository = this.get('repository');
        var model = repository.findById(location_level_pk);
        let filter = (location_level) => {
            return location_level.get('id') !== model.get('id'); 
        };
        let filter_loc_levels = this.get('store').find('location-level', filter.bind(model), ['id']);
        filter_loc_levels.forEach((x) => {
            console.log(x.get('name'));
        });
        // let all_location_levels = this.get('store').find('location-level');
        // let filter_loc_levels = all_location_levels.filter((loc_level) => {
        //     return loc_level.get('name') !== model.get('name');
        // });
        return Ember.RSVP.hash({
            model: model,
            filt_loc_levels: filter_loc_levels
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('filt_loc_levels', hash.filt_loc_levels);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'location-level';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelSingle;

