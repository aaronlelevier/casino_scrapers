import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelSingle =  Ember.Route.extend({
    repository: inject('location-level'),
    model(params) {
        var location_pk = params.location_level_id;
        var repository = this.get('repository');
        var all_location_levels = this.get('store').find('location-level');
        var model = repository.findById(location_pk);
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
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'location-level';
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelSingle;

