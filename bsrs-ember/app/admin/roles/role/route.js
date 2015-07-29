import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

export default Ember.Route.extend({
    repository: inject('role'),
    category_repo: inject('category'),
    model(params) {
        var role_pk = params.role_id,
            repository = this.get('repository'),
            role = repository.findById(role_pk),
            categories = this.get('category_repo').find();

        return Ember.RSVP.hash({
            model: role,
            categories: categories
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
