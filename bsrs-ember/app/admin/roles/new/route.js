import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var RoleNewRoute = TabNewRoute.extend({
    repository: inject('role'),
    redirectRoute: Ember.computed(function() { return 'admin.roles.index'; }),
    modelName: Ember.computed(function() { return 'role'; }),
    templateModelField: Ember.computed(function() { return 'Role'; }),
    model(params) {
        const repository = this.get('repository');
        const all_role_types = this.get('store').find('role-type');
        const all_location_levels = this.get('store').find('location-level');
        let model = this.get('store').find('role', {id: params.new_id}).objectAt(0);
        if(!model){
            const all_role_types = this.get('store').find('role-type');
            const default_role_type = all_role_types.objectAt(0).get('name');
            model = this.get('repository').create(default_role_type, parseInt(params.new_id));
        }
        return {
            model: model,
            all_role_types: all_role_types,
            all_location_levels: all_location_levels,
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_role_types', hash.all_role_types);
        controller.set('all_location_levels', hash.all_location_levels);
    }
});

export default RoleNewRoute;
