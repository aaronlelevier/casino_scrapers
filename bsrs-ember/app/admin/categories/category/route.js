import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import RollbackModalMixin from 'bsrs-ember/mixins/route/rollback/existing';

var CategorySingleRoute = Ember.Route.extend(RollbackModalMixin, {
    repository: inject('category'),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model(params, transition) {
        let search = transition.queryParams.search;
        let categories_children = this.get('repository').findCategoryChildren(search) || [];
        let model = this.get('repository').findById(params.category_id);
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
