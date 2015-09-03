import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelSingle =  Ember.Route.extend({
    repository: inject('location-level'),
    model(params) {
        var location_level_pk = params.location_level_id;
        var repository = this.get('repository');
        return repository.findById(location_level_pk);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel;
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

