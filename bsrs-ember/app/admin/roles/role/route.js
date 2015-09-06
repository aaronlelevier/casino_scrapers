import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import RollbackModalMixin from 'bsrs-ember/mixins/route/rollback/existing';

export default Ember.Route.extend(RollbackModalMixin, {
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
