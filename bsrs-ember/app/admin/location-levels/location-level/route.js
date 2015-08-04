import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var LocationLevelSingle =  Ember.Route.extend({
    repository: inject('location-level'),
    model(params) {
        var location_pk = params.location_level_id;
        var repository = this.get('repository');
        return repository.findById(location_pk);
    },
    actions: {
        // willTransition(transition) {
        //     var model = this.currentModel.model;
        //     if (model.get('isDirtyOrRelatedDirty')) {
        //         $('.t-modal').modal('show');
        //         this.trx.attemptedTransition = transition;
        //         this.trx.attemptedTransitionModel = model;
        //         this.trx.storeType = 'location-level';
        //         transition.abort();
        //     } else {
        //         $('.t-modal').modal('hide');
        //     }
        // },
        // deleteLocation() {
        //     var model = this.modelFor('admin.locations.location');
        //     // model.destroyRecord().then(() => {
        //     //   this.transitionTo('admin.people');
        //     // });
        //     this.transitionTo('admin.location-levels');
        // },
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelSingle;

