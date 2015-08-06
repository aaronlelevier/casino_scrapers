import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';

export default Ember.Route.extend({
    uuid: inject('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        var all_role_types = this.get('store').find('role-type');
        var default_role_type = all_role_types.objectAt(0).get('name');
        var all_location_levels = this.get('store').find('location-level');
        var default_location_level = all_location_levels.objectAt(0).get('id');
        var model = this.get('store').push('role', {id: pk, role_type: default_role_type, location_level: default_location_level});

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
