import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectStore from 'bsrs-ember/utilities/store';
import TabRoute from 'bsrs-ember/route/tab/route';
import FindById from 'bsrs-ember/mixins/route/findById';

var RoleRoute = TabRoute.extend(FindById, {
    store: injectStore('main'),
    repository: inject('role'),
    redirectRoute: Ember.computed(function() { return 'admin.roles.index'; }),
    modelName: Ember.computed(function() { return 'role'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params, transition) {
        const store = this.get('store');
        const pk = params.role_id;
        const repository = this.get('repository');
        const all_role_types = store.find('role-type');
        const all_location_levels = store.find('location-level');
        let role = repository.fetch(pk);
        const override = true;
        return this.findByIdScenario(role, pk, {all_role_types:all_role_types, all_location_levels:all_location_levels}, override);
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_role_types', hash.all_role_types);
        controller.set('all_location_levels', hash.all_location_levels);
    } 
});

export default RoleRoute;
