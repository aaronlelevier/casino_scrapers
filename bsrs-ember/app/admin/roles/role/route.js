import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    repository: inject('role'),
    model(params) {
        var role_pk = params.role_id,
            repository = this.get('repository'),
            role = repository.findById(role_pk);

        return Ember.RSVP.hash({
            model: role
        });
    },
    setupController(controller, hash) {
        controller.set('model', hash.model);
        controller.set('categories', hash.categories);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('isDirtyOrRelatedDirty')) {
                $('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'role';
                transition.abort();
            } else {
                $('.t-modal').modal('hide');
            }
        },
        deleteRole() {
            var model = this.modelFor('admin.roles.role');
            // model.destroyRecord().then(() => {
            //   this.transitionTo('admin.people');
            // });
            this.transitionTo('admin.roles');
        },
        redirectUser() {
            this.transitionTo('admin.roles');
        }
    }
});
