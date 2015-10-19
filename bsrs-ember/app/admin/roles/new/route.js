import Ember from 'ember';
import inject from 'bsrs-ember/utilities/uuid';
import injectRepo from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var RoleNewRoute = TabRoute.extend({
    uuid: inject('uuid'),
    repository: injectRepo('role'),
    redirectRoute: Ember.computed(function() { return 'admin.roles.index'; }),
    modelName: Ember.computed(function() { return 'role'; }),
    templateModelField: Ember.computed(function() { return 'Role'; }),
    model() {
        let pk = this.get('uuid').v4();
        let repository = this.get('repository');
        let all_role_types = this.get('store').find('role-type');
        let default_role_type = all_role_types.objectAt(0).get('name');
        let all_location_levels = this.get('store').find('location-level');
        let model = this.get('store').push('role', {id: pk, role_type: default_role_type});
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
    }
});

export default RoleNewRoute;
