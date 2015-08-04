import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';

var LocationLevelNew = Ember.Route.extend({
    uuid: injectUUID('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        return this.get('store').push('location-level', {id: pk});
    },
    actions: {
        // willTransition(transition) {
        //     var model = this.currentModel.model;
        //     if (model.get('isDirtyOrRelatedDirty')) {
        //         $('.t-modal').modal('show');
        //         this.trx.attemptedTransition = transition;
        //         this.trx.attemptedTransitionModel = model;
        //         this.trx.newModel = true;
        //         this.trx.storeType = 'location-level';
        //         transition.abort();
        //     } else {
        //         $('.t-modal').modal('hide');
        //     }
        // },
        redirectUser() {
            this.transitionTo('admin.location-levels');
        }
    }
});

export default LocationLevelNew;
