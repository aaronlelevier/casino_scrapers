import Ember from 'ember';
import TabRoute from 'bsrs-ember/admin/tab/route';
import inject from 'bsrs-ember/utilities/inject';

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
        let categories_children = this.get('repository').findCategoryChildren(search) || [];
        let category = this.get('store').find('category', pk);
        if (!category.get('length') || category.get('isNotDirtyOrRelatedNotDirty')) { 
            category = this.get('repository').findById(pk);
        }
        return Ember.RSVP.hash({
            model: category,
            categories_children: categories_children,
            search: search
        });
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('categories_children', hash.categories_children);
        controller.set('search', hash.search);
    },
    actions: {
        redirectUser() {
            this.transitionTo('admin.categories');
        }
    }
});

export default CategorySingleRoute;
