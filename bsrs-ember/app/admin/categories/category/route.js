import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var CategorySingleRoute = TabRoute.extend({
    repository: inject('category'),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    redirectRoute: Ember.computed(function() { return 'admin.categories.index'; }),
    modelName: Ember.computed(function() { return 'category'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params, transition) {
        let pk = params.category_id;
        let search = transition.queryParams.search;
        let repository = this.get('repository');
        let categories_children = repository.findCategoryChildren(search) || [];
        let category = this.get('store').find('category', pk);
        if (!category.get('length') || category.get('isNotDirtyOrRelatedNotDirty')) { 
            category = repository.findById(pk);
        }
        return Ember.RSVP.hash({
            model: category,
            categories_children: categories_children,
            search: search,
            repository: repository
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('categories_children', hash.categories_children);
        controller.set('search', hash.search);
        controller.set('repository', hash.repository);
    },
});

export default CategorySingleRoute;
