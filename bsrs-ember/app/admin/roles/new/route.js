import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import NewRollbackModalMixin from 'bsrs-ember/mixins/route/rollback/new';

export default Ember.Route.extend(NewRollbackModalMixin, {
    uuid: inject('uuid'),
    model() {
        var pk = this.get('uuid').v4();
        var all_role_types = this.get('store').find('role-type');
        var default_role_type = all_role_types.objectAt(0).get('name');
        var all_location_levels = this.get('store').find('location-level');
        var model = this.get('store').push('role', {id: pk, new: true, role_type: default_role_type});
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
        redirectUser() {
            this.transitionTo('admin.roles');
        }
    }
});
