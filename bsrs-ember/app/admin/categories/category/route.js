import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';

var CategorySingleRoute = Ember.Route.extend({
    repository: inject('category'),
    tabList: Ember.inject.service(),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model(params, transition) {
        let search = transition.queryParams.search;
        let categories_children = this.get('repository').findCategoryChildren(search) || [];
        let model = this.get('repository').findById(params.category_id);
        this.get('tabList').createTab(this.routeName, 'category', params.category_id, 'admin.categories.index');
        return Ember.RSVP.hash({
            model: model,
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
