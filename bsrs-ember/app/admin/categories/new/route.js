import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import injectUUID from 'bsrs-ember/utilities/uuid';
import TabRoute from 'bsrs-ember/route/tab/new-route';

var CategoryNewRoute = TabRoute.extend({
    repository: inject('category'),
    uuid: injectUUID('uuid'),
    redirectRoute: Ember.computed(function() { return 'admin.categories.index'; }),
    modelName: Ember.computed(function() { return 'category'; }),
    templateModelField: Ember.computed(function() { return 'Category'; }),
    queryParams: {
        search: {
            refreshModel: true
        },
    },
    model() {
        let transition = arguments[1];
        let repository = this.get('repository');
        let categories_children = [];
        let search = transition.queryParams.search;
        search = search ? search.trim() : search;
        if (search) {  
            categories_children = repository.findCategoryChildren(search);
        }
        let pk = this.get('uuid').v4();
        let model = this.get('store').push('category', {id: pk});
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
    }
});

export default CategoryNewRoute;
