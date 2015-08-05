import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Route.extend({
    uuid: injectUUID('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        return this.get('store').push('role', {id: pk});
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                this.trx.storeType = 'role';
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        redirectUser() {
            this.transitionTo('admin.roles');
        }
    }
});
