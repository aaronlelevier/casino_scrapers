import Ember from 'ember';
import injectUUID from 'bsrs-ember/utilities/uuid';

export default Ember.Route.extend({
    uuid: injectUUID('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        return Ember.RSVP.hash({
            model: this.get('store').push('role', {id: pk}),
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.newModel = true;
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        saveRole() {
            this.transitionTo('admin.roles');
        },
        redirectUser() {
            this.transitionTo('admin.roles');
        }
    }
});
