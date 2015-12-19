import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabNewRoute from 'bsrs-ember/route/tab/new-route';

var CategoryNewRoute = TabNewRoute.extend({
    repository: inject('category'),
    redirectRoute: Ember.computed(function() { return 'admin.categories.index'; }),
    modelName: Ember.computed(function() { return 'category'; }),
    templateModelField: Ember.computed(function() { return 'Category'; }),
    model(params) {
        let transition = arguments[1];
        let repository = this.get('repository');
        let search = transition.queryParams.search;
        let categories_children = repository.findCategoryChildren(search);
        let model = this.get('store').find('category', {id: params.new_id}).objectAt(0);
        if(!model){
            model = this.get('repository').create(parseInt(params.new_id));
        }
        return {
            model: model,
            categories_children: categories_children,
        };
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
        controller.set('categories_children', hash.categories_children);
    }
});

export default CategoryNewRoute;
