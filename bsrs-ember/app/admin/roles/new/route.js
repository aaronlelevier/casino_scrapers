import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var RoleNewRoute = TabRoute.extend({
    repository: inject('role'),
    categoryRepo: inject('category'),
    redirectRoute: Ember.computed(function() { return 'admin.roles.index'; }),
    modelName: Ember.computed(function() { return 'role'; }),
    templateModelField: Ember.computed(function() { return 'Role'; }),
    model_fetch: Ember.computed(function() {
    }),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model() {
        const repository = this.get('repository');
        const all_role_types = this.get('store').find('role-type');
        const default_role_type = all_role_types.objectAt(0).get('name');
        const all_location_levels = this.get('store').find('location-level');
        const model = this.get('repository').create(default_role_type);
        const search = arguments[1].queryParams.search;
        const categoryRepo = this.get('categoryRepo');
        const categories_children = categoryRepo.findCategoryChildren(search);
        return Ember.RSVP.hash({
            model: model,
            all_role_types: all_role_types,
            all_location_levels: all_location_levels,
            categories_children: categories_children,
            search: search
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('all_role_types', hash.all_role_types);
        controller.set('all_location_levels', hash.all_location_levels);
        controller.set('categories_children', hash.categories_children);
        controller.set('search', hash.search);
    }
});

export default RoleNewRoute;
