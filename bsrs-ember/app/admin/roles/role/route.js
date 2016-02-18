import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';

var RoleRoute = TabRoute.extend({
    store: injectStore('main'),
    repository: inject('role'),
    redirectRoute: Ember.computed(function() { return 'admin.roles.index'; }),
    modelName: Ember.computed(function() { return 'role'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params, transition) {
        const role_pk = params.role_id;
        const repository = this.get('repository');
        const all_role_types = this.get('store').find('role-type');
        const all_location_levels = this.get('store').find('location-level');
        let role = this.get('store').find('role', role_pk);
        return new Ember.RSVP.Promise((resolve) => {
            // if (!role.get('length') || role.get('isNotDirtyOrRelatedNotDirty')) {
            repository.findById(role_pk).then((model) => {
                role = model;
                resolve({model:role, all_role_types, all_location_levels});
            });
            // }
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_role_types', hash.all_role_types);
        controller.set('all_location_levels', hash.all_location_levels);
    } 
});

export default RoleRoute;
