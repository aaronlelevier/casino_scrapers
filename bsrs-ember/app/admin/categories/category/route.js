import Ember from 'ember';
import inject from 'bsrs-ember/utilities/inject';
import TabRoute from 'bsrs-ember/route/tab/route';

var CategorySingle = TabRoute.extend({
    repository: inject('category'),
    redirectRoute: Ember.computed(function() { return 'admin.categories.index'; }),
    modelName: Ember.computed(function() { return 'category'; }),
    templateModelField: Ember.computed(function() { return 'name'; }),
    model(params, transition) {
        const pk = params.category_id;
        const repository = this.get('repository');
        let category = repository.fetch(pk);
        if(!category.get('length') || category.get('isNotDirtyOrRelatedNotDirty')){ 
            category = repository.findById(pk);
        }
        return { model:category }; 
    },
    setupController: function(controller, hash) {
        controller.set('model', hash.model);
    },
});

export default CategorySingle;
