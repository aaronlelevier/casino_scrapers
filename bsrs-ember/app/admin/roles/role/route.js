import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    repository: inject('role'),
    model(params) {
        var role_pk = params.role_id;
        var repository = this.get('repository');
        var all_role_types = this.get('store').find('role-type');
        var all_location_levels = this.get('store').find('location-level');
        var model = repository.findById(role_pk);

        return Ember.RSVP.hash({
            model: model,
            all_role_types: all_role_types,
            all_location_levels: all_location_levels
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_role_types', hash.all_role_types);
        controller.set('all_location_levels', hash.all_location_levels);
    },
    actions: {
        willTransition(transition) {
            var model = this.currentModel.model;
            if (model.get('dirtyOrRelatedDirty')) {
                Ember.$('.t-modal').modal('show');
                this.trx.attemptedTransition = transition;
                this.trx.attemptedTransitionModel = model;
                this.trx.storeType = 'role';
                transition.abort();
            } else {
                Ember.$('.t-modal').modal('hide');
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
