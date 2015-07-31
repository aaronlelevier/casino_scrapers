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
        saveRole() {
            this.transitionTo('admin.roles');
        },
        deleteRole() {
            var model = this.modelFor('admin.roles.role');
            // model.destroyRecord().then(() => {
            //   this.transitionTo('admin.people');
            // });
            this.transitionTo('admin.roles');
        },
        cancelRole() {
            this.transitionTo('admin.roles');
        }
    }
});
