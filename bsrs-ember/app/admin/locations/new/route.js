import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

var LocationNewRoute = Ember.Route.extend({
    uuid: inject('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        return this.get('store').push('location', {id: pk});
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                this.trx.storeType = 'location';
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.locations');
        }
    }
});

export default LocationNewRoute;
